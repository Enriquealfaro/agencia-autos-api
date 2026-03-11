package com.agencia.autos.web.rest;

import com.agencia.autos.domain.enumeration.AutoStatus;
import com.agencia.autos.service.AutoService;
import com.agencia.autos.service.dto.AutoDTO;
import com.agencia.autos.web.rest.errors.BadRequestAlertException;
import jakarta.validation.Valid;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

@RestController
@RequestMapping("/api/autos")
public class AutoResource {

    private static final Logger LOG = LoggerFactory.getLogger(AutoResource.class);

    private static final String ENTITY_NAME = "auto";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final AutoService autoService;

    public AutoResource(AutoService autoService) {
        this.autoService = autoService;
    }

    @PostMapping("")
    public ResponseEntity<AutoDTO> createAuto(@Valid @RequestBody AutoDTO autoDTO) throws URISyntaxException {
        LOG.debug("REST request to save Auto : {}", autoDTO);
        if (autoDTO.getId() != null) {
            throw new BadRequestAlertException("A new auto cannot already have an ID", ENTITY_NAME, "idexists");
        }
        autoDTO.setStatus(AutoStatus.PENDING);

        AutoDTO result = autoService.save(autoDTO);
        return ResponseEntity.created(new URI("/api/autos/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    @PostMapping(value = "/with-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AutoDTO> createAutoWithImage(
        @RequestParam("marca") String marca,
        @RequestParam("modelo") String modelo,
        @RequestParam("color") String color,
        @RequestParam("anio") Integer anio,
        @RequestParam("precio") java.math.BigDecimal precio,
        @RequestParam("transmision") String transmision,
        @RequestParam("imagen") MultipartFile imagen
    ) throws URISyntaxException {
        AutoDTO autoDTO = new AutoDTO();
        autoDTO.setMarca(marca);
        autoDTO.setModelo(modelo);
        autoDTO.setColor(color);
        autoDTO.setAnio(anio);
        autoDTO.setPrecio(precio);
        autoDTO.setTransmision(transmision);
        autoDTO.setStatus(AutoStatus.PENDING);

        LOG.debug("REST request to save Auto with image : {}", autoDTO);
        AutoDTO result = autoService.saveWithImage(autoDTO, imagen);
        return ResponseEntity.created(new URI("/api/autos/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    @GetMapping("")
    public ResponseEntity<List<AutoDTO>> getAllAutos(@org.springdoc.core.annotations.ParameterObject Pageable pageable) {
        LOG.debug("REST request to get a page of approved Autos");
        Page<AutoDTO> page = autoService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    @GetMapping("/pending")
    public ResponseEntity<List<AutoDTO>> getPendingAutos() {
        LOG.debug("REST request to get pending Autos");
        return ResponseEntity.ok(autoService.findByStatus(AutoStatus.PENDING));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AutoDTO> getAuto(@PathVariable("id") Long id) {
        LOG.debug("REST request to get Auto : {}", id);
        return ResponseUtil.wrapOrNotFound(autoService.findOne(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<AutoDTO> updateAutoStatus(@PathVariable("id") Long id, @RequestParam("status") AutoStatus status) {
        LOG.debug("REST request to update Auto status : {}, {}", id, status);
        return ResponseEntity.ok(autoService.updateStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAuto(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete Auto : {}", id);
        autoService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
