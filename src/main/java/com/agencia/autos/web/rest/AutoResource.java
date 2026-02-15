package com.agencia.autos.web.rest;

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
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
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

        AutoDTO result = autoService.save(autoDTO);
        return ResponseEntity.created(new URI("/api/autos/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    @GetMapping("")
    public ResponseEntity<List<AutoDTO>> getAllAutos(@org.springdoc.core.annotations.ParameterObject Pageable pageable) {
        LOG.debug("REST request to get a page of Autos");
        Page<AutoDTO> page = autoService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AutoDTO> getAuto(@PathVariable("id") Long id) {
        LOG.debug("REST request to get Auto : {}", id);
        return ResponseUtil.wrapOrNotFound(autoService.findOne(id));
    }
}
