package com.oficioya.backend.service;

import com.oficioya.backend.dto.UsuarioResponse;
import com.oficioya.backend.entity.Usuario;
import com.oficioya.backend.exception.RecursoNoEncontradoException;
import com.oficioya.backend.repository.UsuarioRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;

    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public List<UsuarioResponse> listar() {
        return usuarioRepository.findAll()
                .stream()
                .map(this::convertirResponse)
                .toList();
    }

    public UsuarioResponse buscarPorId(Long id) {
        return convertirResponse(obtenerUsuario(id));
    }

    public Usuario obtenerUsuario(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() ->
                        new RecursoNoEncontradoException(
                                "Usuario no encontrado"));
    }

    public Usuario obtenerPorCorreo(String correo) {
        return usuarioRepository.findByCorreo(correo)
                .orElseThrow(() ->
                        new RecursoNoEncontradoException(
                                "Usuario no encontrado"));
    }

    public UsuarioResponse convertirResponse(Usuario usuario) {

        return new UsuarioResponse(
                usuario.getId(),
                usuario.getNombres(),
                usuario.getApellidos(),
                usuario.getCorreo(),
                usuario.getTelefono(),
                usuario.getRol(),
                usuario.isActivo(),
                usuario.getFechaRegistro()
        );
    }
}