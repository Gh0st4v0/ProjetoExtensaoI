package com.example.SpringBootApp.services;

import com.example.SpringBootApp.DTOs.ClienteCreateDTO;
import com.example.SpringBootApp.DTOs.ClienteResponseDTO;
import com.example.SpringBootApp.models.Cliente;
import com.example.SpringBootApp.repositories.ClienteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class ClienteService {

    private final ClienteRepository clienteRepository;

    public Cliente createClient(ClienteCreateDTO dto) {
        Cliente c = new Cliente();
        c.setNickname(dto.getNickname());
        return clienteRepository.save(c);
    }

    public Page<ClienteResponseDTO> searchClients(String q, int page) {
        int size = 10;
        var pageable = PageRequest.of(page, size);
        if (q == null || q.trim().length() < 2) {
            return Page.empty(pageable);
        }
        Page<Cliente> result = clienteRepository.findByNicknameContainingIgnoreCase(q.trim(), pageable);
        return result.map(c -> {
            ClienteResponseDTO r = new ClienteResponseDTO();
            r.setId(c.getId());
            r.setNickname(c.getNickname());
            return r;
        });
    }
}
