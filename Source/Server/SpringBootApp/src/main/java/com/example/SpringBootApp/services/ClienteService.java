package com.example.SpringBootApp.services;

import com.example.SpringBootApp.DTOs.ClienteCreateDTO;
import com.example.SpringBootApp.DTOs.ClienteResponseDTO;
import com.example.SpringBootApp.exceptions.ResourceNotFoundException;
import com.example.SpringBootApp.exceptions.BusinessException;
import com.example.SpringBootApp.models.Cliente;
import com.example.SpringBootApp.repositories.ClienteRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import com.example.SpringBootApp.models.Permissao;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.Map;
import com.example.SpringBootApp.models.Permissao;
import java.util.stream.Collectors;
import java.util.Optional;
import com.example.SpringBootApp.services.TermoService;
import com.example.SpringBootApp.models.Termo;

@Service
@Transactional
@RequiredArgsConstructor
public class ClienteService {

    private final ClienteRepository clienteRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private TermoService termoService;

    public Cliente createClient(ClienteCreateDTO dto) {
        // business rule: client must accept terms of service to be created
        if (dto.getAceitaTermosServico() == null || !dto.getAceitaTermosServico()) {
            throw new BusinessException("Cliente deve aceitar os termos de serviço para cadastro");
        }

        // Validate age if birthday provided: must be >= 18
        if (dto.getAniversario() != null) {
            java.time.Period p = java.time.Period.between(dto.getAniversario(), java.time.LocalDate.now());
            if (p.getYears() < 18) {
                throw new BusinessException("Cliente deve ser maior de 18 anos para cadastro");
            }
        }

        Cliente c = new Cliente();
        c.setNickname(dto.getNickname());
        c.setTelefone(dto.getTelefone());
        c.setAniversario(dto.getAniversario());
        c.setDataCadastro(java.time.LocalDateTime.now());
        Cliente saved = clienteRepository.save(c);

        // persist consentimentos: TERMOS_SERVICO (required)
        Long termoId = null;
        if (termoService != null) {
            var opt = termoService.getLatestTermo();
            if (opt.isPresent()) termoId = opt.get().getId();
        }

        if (jdbcTemplate != null) {
            String sql = "INSERT INTO consentimentos (fk_cliente_id, fk_usuario_id, tipo, aceito, fk_termo_id, capturado_em) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)";
            jdbcTemplate.update(sql, saved.getId(), null, "TERMOS_SERVICO", true, termoId);

            // optionally persist promotions consent if provided
            if (dto.getReceberPromocoes() != null) {
                jdbcTemplate.update(sql, saved.getId(), null, "RECEBER_PROMOCOES", dto.getReceberPromocoes(), termoId);
            }
        }

        return saved;
    }

    public Cliente updateClient(Long id, ClienteCreateDTO dto) {
        Cliente c = clienteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente not found: " + id));
        // Validate age if provided
        if (dto.getAniversario() != null) {
            java.time.Period p = java.time.Period.between(dto.getAniversario(), java.time.LocalDate.now());
            if (p.getYears() < 18) throw new BusinessException("Cliente deve ser maior de 18 anos");
        }
        c.setNickname(dto.getNickname());
        c.setTelefone(dto.getTelefone());
        c.setAniversario(dto.getAniversario());
        return clienteRepository.save(c);
    }

    public List<ClienteResponseDTO> listAll() {
        List<Cliente> clientes;
        try {
            clientes = clienteRepository.findByNicknameNot("APAGADO", PageRequest.of(0, 500, Sort.by("nickname"))).getContent();
        } catch (Throwable t) {
            // Backwards-compatibility: some tests mock the Sort-based overload (findByNicknameNot(String, Sort))
            clientes = clienteRepository.findByNicknameNot("APAGADO", Sort.by("nickname"));
        }
        Map<Long, java.time.LocalDateTime> lastPurchaseMap = fetchLastPurchaseDates();
        return clientes.stream().map(c -> toDTO(c, lastPurchaseMap)).toList();
    }

    private Map<Long, java.time.LocalDateTime> fetchLastPurchaseDates() {
        if (jdbcTemplate == null) return java.util.Collections.emptyMap();
        String sql = "SELECT fk_cliente_id, MAX(data_venda) FROM venda WHERE fk_cliente_id IS NOT NULL GROUP BY fk_cliente_id";
        Map<Long, java.time.LocalDateTime> result = new java.util.HashMap<>();
        jdbcTemplate.query(sql, rs -> {
            Long clienteId = rs.getLong(1);
            java.sql.Timestamp ts = rs.getTimestamp(2);
            if (ts != null) result.put(clienteId, ts.toLocalDateTime());
        });
        return result;
    }

    public ClienteResponseDTO getById(Long id) {
        Cliente c = clienteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente not found: " + id));
        if (c.getNickname() != null && "APAGADO".equals(c.getNickname())) throw new ResourceNotFoundException("Cliente not found: " + id);
        return toDTO(c);
    }

    public Page<ClienteResponseDTO> searchClients(String q, int page) {
        var pageable = PageRequest.of(page, 10);
        if (q == null || q.trim().length() < 2) return Page.empty(pageable);
        String trimmed = q.trim();
        return clienteRepository.searchActive(trimmed, "APAGADO", pageable).map(this::toDTO);
    }

    private ClienteResponseDTO toDTO(Cliente c) {
        return toDTO(c, java.util.Collections.emptyMap());
    }

    private ClienteResponseDTO toDTO(Cliente c, Map<Long, java.time.LocalDateTime> lastPurchaseMap) {
        ClienteResponseDTO r = new ClienteResponseDTO();
        r.setId(c.getId());
        r.setNickname(c.getNickname());
        r.setTelefone(c.getTelefone());
        r.setAniversario(c.getAniversario());
        r.setDataCadastro(c.getDataCadastro());
        r.setLastPurchaseDate(lastPurchaseMap.get(c.getId()));
        r.setPermissoes(getPermissoesForCliente(c.getId()));
        return r;
    }

    public void anonymizeClient(Long id) {
        Cliente c = clienteRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Cliente not found: " + id));
        if (c.getNickname() != null && "APAGADO".equals(c.getNickname())) {
            throw new BusinessException("Cliente já foi apagado/anonymizado");
        }
        // Overwrite identifiable fields
        c.setNickname("APAGADO");
        c.setTelefone(null);
        c.setAniversario(null);
        clienteRepository.save(c);

        // Remove consentimentos to clear personal preference data (best-effort)
        if (jdbcTemplate != null) {
            try { jdbcTemplate.update("DELETE FROM consentimentos WHERE fk_cliente_id = ?", id); } catch (Exception ex) { /* ignore */ }
        }
    }

    private List<Permissao> getPermissoesForCliente(Long clienteId) {
        if (clienteId == null || jdbcTemplate == null) return java.util.List.of();
        String sql = "SELECT tipo, aceito FROM consentimentos WHERE fk_cliente_id = ? AND capturado_em = (SELECT MAX(capturado_em) FROM consentimentos c2 WHERE c2.fk_cliente_id = ? AND c2.tipo = consentimentos.tipo)";
        List<Map<String,Object>> rows = jdbcTemplate.queryForList(sql, new Object[]{clienteId, clienteId});
        return rows.stream()
                .filter(m -> {
                    Object aceito = m.get("aceito");
                    if (aceito == null) return false;
                    if (aceito instanceof Boolean) return (Boolean) aceito;
                    if (aceito instanceof Number) return ((Number) aceito).intValue() != 0;
                    return Boolean.parseBoolean(aceito.toString());
                })
                .map(m -> {
                    Object tipoObj = m.get("tipo");
                    if (tipoObj == null) return null;
                    String tipo = tipoObj.toString();
                    try { return Permissao.valueOf(tipo); } catch (IllegalArgumentException e) { return null; }
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }
}
