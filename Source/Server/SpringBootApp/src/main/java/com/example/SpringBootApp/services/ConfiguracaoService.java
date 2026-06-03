package com.example.SpringBootApp.services;

import com.example.SpringBootApp.DTOs.ConfiguracaoCreateDTO;
import com.example.SpringBootApp.models.Configuracao;
import com.example.SpringBootApp.repositories.ConfiguracaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ConfiguracaoService {
    private final ConfiguracaoRepository configuracaoRepository;

    private static final java.math.BigDecimal DEFAULT_LUCRO_ESPERADO = new java.math.BigDecimal("20.00");
    private static final java.math.BigDecimal DEFAULT_TAXA_DEBITO = new java.math.BigDecimal("2.50");
    private static final java.math.BigDecimal DEFAULT_TAXA_CREDITO = new java.math.BigDecimal("3.50");

    public Configuracao createConfiguracao(ConfiguracaoCreateDTO dto) {
        Configuracao c = new Configuracao();
        c.setLucroEsperado(dto.getLucroEsperado());
        c.setTaxaDebito(dto.getTaxaDebito());
        c.setTaxaCredito(dto.getTaxaCredito());
        c.setAcrescimoCredito(dto.getAcrescimoCredito() != null ? dto.getAcrescimoCredito() : java.math.BigDecimal.ZERO);
        c.setCreatedAt(LocalDateTime.now());
        c.setUpdatedAt(LocalDateTime.now());
        return configuracaoRepository.save(c);
    }

    public Optional<Configuracao> getLatestConfiguracao() {
        return configuracaoRepository.findFirstByOrderByIdDesc();
    }

    public List<Configuracao> getAllConfiguracoes() {
        return configuracaoRepository.findTop20ByOrderByIdDesc();
    }

    public Configuracao getConfiguracaoForDate(LocalDateTime date) {
        Optional<Configuracao> opt = configuracaoRepository.findFirstByCreatedAtLessThanEqualOrderByCreatedAtDesc(date);
        if (opt.isPresent()) return opt.get();
        Optional<Configuracao> latest = getLatestConfiguracao();
        if (latest.isPresent()) return latest.get();
        Configuracao c = new Configuracao();
        c.setLucroEsperado(DEFAULT_LUCRO_ESPERADO);
        c.setTaxaDebito(DEFAULT_TAXA_DEBITO);
        c.setTaxaCredito(DEFAULT_TAXA_CREDITO);
        c.setAcrescimoCredito(java.math.BigDecimal.ZERO);
        c.setCreatedAt(LocalDateTime.now());
        c.setUpdatedAt(LocalDateTime.now());
        return c;
    }
}
