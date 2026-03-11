package com.agencia.autos.service.impl;

import com.agencia.autos.config.ApplicationProperties;
import com.agencia.autos.domain.Auto;
import com.agencia.autos.domain.enumeration.AutoStatus;
import com.agencia.autos.repository.AutoRepository;
import com.agencia.autos.service.AutoService;
import com.agencia.autos.service.dto.AutoDTO;
import com.agencia.autos.web.rest.errors.BadRequestAlertException;
import java.io.IOException;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
@Transactional
public class AutoServiceImpl implements AutoService {

    private static final String ENTITY_NAME = "auto";
    private static final Pattern IMAGE_NAME_PATTERN = Pattern.compile("^imagenesAutos_auto_(\\d+)\\.[a-zA-Z0-9]+$");
    private static final Object IMAGE_LOCK = new Object();

    private final AutoRepository autoRepository;
    private final ApplicationProperties applicationProperties;

    public AutoServiceImpl(AutoRepository autoRepository, ApplicationProperties applicationProperties) {
        this.autoRepository = autoRepository;
        this.applicationProperties = applicationProperties;
    }

    @Override
    public AutoDTO save(AutoDTO autoDTO) {
        Auto auto = toEntity(autoDTO);
        if (auto.getStatus() == null) {
            auto.setStatus(AutoStatus.PENDING);
        }
        auto = autoRepository.save(auto);
        return toDto(auto);
    }

    @Override
    public AutoDTO saveWithImage(AutoDTO autoDTO, MultipartFile imageFile) {
        if (imageFile == null || imageFile.isEmpty()) {
            throw new BadRequestAlertException("Image file is required", ENTITY_NAME, "imagerequired");
        }
        Auto auto = toEntity(autoDTO);
        auto.setStatus(AutoStatus.PENDING);

        synchronized (IMAGE_LOCK) {
            StoredImage storedImage = buildStoredImageMetadata(imageFile);
            auto.setImagenUrl(storedImage.publicUrl());
            auto = autoRepository.saveAndFlush(auto);
            writeImageFile(imageFile, storedImage.targetPath());
            return toDto(auto);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AutoDTO> findAll(Pageable pageable) {
        return autoRepository.findAllByStatus(AutoStatus.APPROVED, pageable).map(this::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AutoDTO> findByStatus(AutoStatus status) {
        return autoRepository.findAllByStatusOrderByIdDesc(status).stream().map(this::toDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<AutoDTO> findOne(Long id) {
        return autoRepository.findById(id).map(this::toDto);
    }

    @Override
    public AutoDTO updateStatus(Long id, AutoStatus status) {
        Auto auto = autoRepository
            .findById(id)
            .orElseThrow(() -> new BadRequestAlertException("Auto not found", ENTITY_NAME, "idnotfound"));
        auto.setStatus(status);
        auto = autoRepository.save(auto);
        return toDto(auto);
    }

    @Override
    public void delete(Long id) {
        Auto auto = autoRepository
            .findById(id)
            .orElseThrow(() -> new BadRequestAlertException("Auto not found", ENTITY_NAME, "idnotfound"));
        autoRepository.delete(auto);
        deleteImageFile(auto.getImagenUrl());
    }

    private Auto toEntity(AutoDTO dto) {
        Auto auto = new Auto();
        auto.setId(dto.getId());
        auto.setMarca(dto.getMarca());
        auto.setModelo(dto.getModelo());
        auto.setColor(dto.getColor());
        auto.setAnio(dto.getAnio());
        auto.setPrecio(dto.getPrecio());
        auto.setTransmision(dto.getTransmision());
        auto.setImagenUrl(dto.getImagenUrl());
        auto.setStatus(dto.getStatus());
        return auto;
    }

    private AutoDTO toDto(Auto auto) {
        AutoDTO dto = new AutoDTO();
        dto.setId(auto.getId());
        dto.setMarca(auto.getMarca());
        dto.setModelo(auto.getModelo());
        dto.setColor(auto.getColor());
        dto.setAnio(auto.getAnio());
        dto.setPrecio(auto.getPrecio());
        dto.setTransmision(auto.getTransmision());
        dto.setImagenUrl(auto.getImagenUrl());
        dto.setStatus(auto.getStatus());
        return dto;
    }

    private StoredImage buildStoredImageMetadata(MultipartFile imageFile) {
        try {
            Path storageDir = Paths.get(applicationProperties.getAutos().getImageStoragePath());
            Files.createDirectories(storageDir);

            String extension = StringUtils.getFilenameExtension(imageFile.getOriginalFilename());
            extension = extension == null || extension.isBlank() ? "jpg" : extension.toLowerCase();

            int nextNumber = getNextImageNumber(storageDir);
            String fileName = "imagenesAutos_auto_" + String.format("%06d", nextNumber) + "." + extension;
            Path targetPath = storageDir.resolve(fileName);
            String publicUrl = "/imagenesAutos/" + fileName;
            return new StoredImage(targetPath, publicUrl);
        } catch (IOException ex) {
            throw new BadRequestAlertException("Could not prepare image file", ENTITY_NAME, "imageprepareerror");
        }
    }

    private void writeImageFile(MultipartFile imageFile, Path targetPath) {
        try {
            Files.copy(imageFile.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ex) {
            try {
                Files.deleteIfExists(targetPath);
            } catch (IOException ignored) {
                // Best-effort cleanup of partial files.
            }
            throw new BadRequestAlertException("Could not store image file", ENTITY_NAME, "imagestoreerror");
        }
    }

    private int getNextImageNumber(Path storageDir) throws IOException {
        int max = 0;
        try (DirectoryStream<Path> stream = Files.newDirectoryStream(storageDir)) {
            for (Path path : stream) {
                Matcher matcher = IMAGE_NAME_PATTERN.matcher(path.getFileName().toString());
                if (matcher.matches()) {
                    int current = Integer.parseInt(matcher.group(1));
                    if (current > max) {
                        max = current;
                    }
                }
            }
        }
        return max + 1;
    }

    private void deleteImageFile(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) {
            return;
        }

        String fileName = Paths.get(imageUrl).getFileName().toString();
        Path targetPath = Paths.get(applicationProperties.getAutos().getImageStoragePath()).resolve(fileName);
        try {
            Files.deleteIfExists(targetPath);
        } catch (IOException ignored) {
            // Best-effort cleanup.
        }
    }

    private record StoredImage(Path targetPath, String publicUrl) {}
}
