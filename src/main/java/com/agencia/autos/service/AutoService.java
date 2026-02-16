package com.agencia.autos.service;

import com.agencia.autos.service.dto.AutoDTO;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

public interface AutoService {
    AutoDTO save(AutoDTO autoDTO);

    AutoDTO saveWithImage(AutoDTO autoDTO, MultipartFile imageFile);

    Page<AutoDTO> findAll(Pageable pageable);

    Optional<AutoDTO> findOne(Long id);
}
