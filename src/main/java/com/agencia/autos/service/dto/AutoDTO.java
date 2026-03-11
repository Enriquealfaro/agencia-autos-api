package com.agencia.autos.service.dto;

import com.agencia.autos.domain.enumeration.AutoStatus;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public class AutoDTO {

    private Long id;

    @NotBlank
    @Size(max = 100)
    private String marca;

    @NotBlank
    @Size(max = 100)
    private String modelo;

    @NotBlank
    @Size(max = 50)
    private String color;

    @NotNull
    @Min(1900)
    @Max(2099)
    private Integer anio;

    @NotNull
    @DecimalMin("0.0")
    @Digits(integer = 10, fraction = 2)
    private BigDecimal precio;

    @NotBlank
    @Size(max = 20)
    private String transmision;

    @Size(max = 255)
    private String imagenUrl;

    @NotNull
    private AutoStatus status;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMarca() {
        return marca;
    }

    public void setMarca(String marca) {
        this.marca = marca;
    }

    public String getModelo() {
        return modelo;
    }

    public void setModelo(String modelo) {
        this.modelo = modelo;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public Integer getAnio() {
        return anio;
    }

    public void setAnio(Integer anio) {
        this.anio = anio;
    }

    public BigDecimal getPrecio() {
        return precio;
    }

    public void setPrecio(BigDecimal precio) {
        this.precio = precio;
    }

    public String getTransmision() {
        return transmision;
    }

    public void setTransmision(String transmision) {
        this.transmision = transmision;
    }

    public String getImagenUrl() {
        return imagenUrl;
    }

    public void setImagenUrl(String imagenUrl) {
        this.imagenUrl = imagenUrl;
    }

    public AutoStatus getStatus() {
        return status;
    }

    public void setStatus(AutoStatus status) {
        this.status = status;
    }

    @Override
    public String toString() {
        return (
            "AutoDTO{" +
            "id=" +
            id +
            ", marca='" +
            marca +
            '\'' +
            ", modelo='" +
            modelo +
            '\'' +
            ", color='" +
            color +
            '\'' +
            ", anio=" +
            anio +
            ", precio=" +
            precio +
            ", transmision='" +
            transmision +
            '\'' +
            ", imagenUrl='" +
            imagenUrl +
            '\'' +
            ", status=" +
            status +
            '}'
        );
    }
}
