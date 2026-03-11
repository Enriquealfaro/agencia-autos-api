package com.agencia.autos.service;

import com.agencia.autos.domain.enumeration.AutoStatus;
import com.agencia.autos.service.dto.AutoDTO;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

public interface AutoService {
    AutoDTO save(AutoDTO autoDTO);

    AutoDTO saveWithImage(AutoDTO autoDTO, MultipartFile imageFile);

    Page<AutoDTO> findAll(Pageable pageable);

    List<AutoDTO> findByStatus(AutoStatus status);

    Optional<AutoDTO> findOne(Long id);

    AutoDTO updateStatus(Long id, AutoStatus status);

    void delete(Long id);
}
