package com.example.SpringBootApp.services;

import com.example.SpringBootApp.DTOs.ClienteCreateDTO;
import com.example.SpringBootApp.DTOs.ClienteResponseDTO;
import com.example.SpringBootApp.exceptions.ResourceNotFoundException;
import com.example.SpringBootApp.models.Cliente;
import com.example.SpringBootApp.repositories.ClienteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class ClienteService {

    private final ClienteRepository clienteRepository;

    public Cliente createClient(ClienteCreateDTO dto) {
        Cliente c = new Cliente();
        c.setNickname(dto.getNickname());
        c.setTelefone(dto.getTelefone());
        c.setDocumento(dto.getDocumento());
        c.setEmail(dto.getEmail());
        return clienteRepository.save(c);
    }

    public Cliente updateClient(Long id, ClienteCreateDTO dto) {
        Cliente c = clienteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente not found: " + id));
        c.setNickname(dto.getNickname());
        c.setTelefone(dto.getTelefone());
        c.setDocumento(dto.getDocumento());
        c.setEmail(dto.getEmail());
        return clienteRepository.save(c);
    }

    public List<ClienteResponseDTO> listAll() {
        return clienteRepository.findAll(Sort.by("nickname").ascending())
                .stream().map(this::toDTO).toList();
    }

    public ClienteResponseDTO getById(Long id) {
        Cliente c = clienteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente not found: " + id));
        return toDTO(c);
    }

    public Page<ClienteResponseDTO> searchClients(String q, int page) {
        var pageable = PageRequest.of(page, 10);
        if (q == null || q.trim().length() < 2) return Page.empty(pageable);
        return clienteRepository.findByNicknameContainingIgnoreCase(q.trim(), pageable).map(this::toDTO);
    }

    private ClienteResponseDTO toDTO(Cliente c) {
        ClienteResponseDTO r = new ClienteResponseDTO();
        r.setId(c.getId());
        r.setNickname(c.getNickname());
        r.setTelefone(c.getTelefone());
        r.setDocumento(c.getDocumento());
        r.setEmail(c.getEmail());
        return r;
    }
}
