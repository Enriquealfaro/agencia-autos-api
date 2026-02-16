package com.agencia.autos.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Properties specific to Agencia Autos Api.
 * <p>
 * Properties are configured in the {@code application.yml} file.
 * See {@link tech.jhipster.config.JHipsterProperties} for a good example.
 */
@ConfigurationProperties(prefix = "application", ignoreUnknownFields = false)
public class ApplicationProperties {

    private final Liquibase liquibase = new Liquibase();
    private final Autos autos = new Autos();

    // jhipster-needle-application-properties-property

    public Liquibase getLiquibase() {
        return liquibase;
    }

    public Autos getAutos() {
        return autos;
    }

    // jhipster-needle-application-properties-property-getter

    public static class Liquibase {

        private Boolean asyncStart = true;

        public Boolean getAsyncStart() {
            return asyncStart;
        }

        public void setAsyncStart(Boolean asyncStart) {
            this.asyncStart = asyncStart;
        }
    }

    public static class Autos {

        private String imageStoragePath = "imagenesAutos";

        public String getImageStoragePath() {
            return imageStoragePath;
        }

        public void setImageStoragePath(String imageStoragePath) {
            this.imageStoragePath = imageStoragePath;
        }
    }
    // jhipster-needle-application-properties-property-class
}
