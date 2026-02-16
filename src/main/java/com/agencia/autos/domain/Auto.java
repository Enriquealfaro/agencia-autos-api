package com.agencia.autos.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;

@Entity
@Table(name = "auto")
public class Auto implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 100)
    @Column(name = "marca", length = 100, nullable = false)
    private String marca;

    @NotBlank
    @Size(max = 100)
    @Column(name = "modelo", length = 100, nullable = false)
    private String modelo;

    @NotBlank
    @Size(max = 50)
    @Column(name = "color", length = 50, nullable = false)
    private String color;

    @NotNull
    @Min(1900)
    @Max(2099)
    @Column(name = "anio", nullable = false)
    private Integer anio;

    @NotNull
    @DecimalMin("0.0")
    @Digits(integer = 10, fraction = 2)
    @Column(name = "precio", precision = 12, scale = 2, nullable = false)
    private BigDecimal precio;

    @NotBlank
    @Size(max = 20)
    @Column(name = "transmision", length = 20, nullable = false)
    private String transmision;

    @Size(max = 255)
    @Column(name = "imagen_url", length = 255)
    private String imagenUrl;

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

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Auto)) {
            return false;
        }
        return id != null && id.equals(((Auto) o).id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return (
            "Auto{" +
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
            '}'
        );
    }
}
