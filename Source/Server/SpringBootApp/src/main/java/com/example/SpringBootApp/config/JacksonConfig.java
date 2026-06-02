package com.example.SpringBootApp.config;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.PageImpl;

@Configuration
public class JacksonConfig {

    @JsonIgnoreProperties({"pageable"})
    private abstract static class PageImplMixin {
    }

    @Bean
    public Jackson2ObjectMapperBuilderCustomizer pageImplMixinCustomizer() {
        return builder -> builder.mixIn(PageImpl.class, PageImplMixin.class);
    }
}
