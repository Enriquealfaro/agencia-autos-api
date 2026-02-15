package com.agencia.autos.service.impl;

import com.agencia.autos.domain.Auto;
import com.agencia.autos.repository.AutoRepository;
import com.agencia.autos.service.AutoService;
import com.agencia.autos.service.dto.AutoDTO;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AutoServiceImpl implements AutoService {

    private final AutoRepository autoRepository;

    public AutoServiceImpl(AutoRepository autoRepository) {
        this.autoRepository = autoRepository;
    }

    @Override
    public AutoDTO save(AutoDTO autoDTO) {
        Auto auto = toEntity(autoDTO);
        auto = autoRepository.save(auto);
        return toDto(auto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AutoDTO> findAll(Pageable pageable) {
        return autoRepository.findAll(pageable).map(this::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<AutoDTO> findOne(Long id) {
        return autoRepository.findById(id).map(this::toDto);
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
        return dto;
    }
}
