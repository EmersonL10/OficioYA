package com.oficioya.backend.service;

import com.oficioya.backend.dto.*;
import com.oficioya.backend.entity.Usuario;
import com.oficioya.backend.enums.Rol;
import com.oficioya.backend.exception.*;
import com.oficioya.backend.repository.UsuarioRepository;
import com.oficioya.backend.security.JwtService;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final UsuarioService usuarioService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(
            UsuarioRepository usuarioRepository,
            UsuarioService usuarioService,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService) {

        this.usuarioRepository = usuarioRepository;
        this.usuarioService = usuarioService;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @Transactional
    public UsuarioResponse registrarCliente(
            RegistroRequest request) {

        return registrar(request, Rol.CLIENTE);
    }

    @Transactional
    public UsuarioResponse registrarProfesional(
            RegistroRequest request) {

        return registrar(request, Rol.PROFESIONAL);
    }

    private UsuarioResponse registrar(
            RegistroRequest request, Rol rol) {

        String correo = request.correo()
                .trim()
                .toLowerCase(Locale.ROOT);

        if (usuarioRepository.existsByCorreo(correo)) {
            throw new ConflictoException(
                    "El correo ya está registrado");
        }

        if (request.contrasena()
                .getBytes(StandardCharsets.UTF_8).length > 72) {

            throw new IllegalArgumentException(
                    "La contraseña supera el límite de 72 bytes");
        }

        Usuario usuario = new Usuario();

        usuario.setNombres(request.nombres().trim());
        usuario.setApellidos(request.apellidos().trim());
        usuario.setCorreo(correo);
        usuario.setContrasena(
                passwordEncoder.encode(request.contrasena()));
        usuario.setTelefono(request.telefono());
        usuario.setRol(rol);
        usuario.setActivo(true);

        return usuarioService.convertirResponse(
                usuarioRepository.save(usuario));
    }

    public LoginResponse login(LoginRequest request) {

        Usuario usuario = autenticar(request);

        if (usuario.getRol() != Rol.CLIENTE
                && usuario.getRol() != Rol.PROFESIONAL) {

            throw new BadCredentialsException(
                    "Credenciales incorrectas");
        }

        return generarRespuesta(usuario);
    }

    public LoginResponse loginAdmin(LoginRequest request) {

        Usuario usuario = autenticar(request);

        if (usuario.getRol() != Rol.ADMIN) {
            throw new BadCredentialsException(
                    "Credenciales incorrectas");
        }

        return generarRespuesta(usuario);
    }

    private Usuario autenticar(LoginRequest request) {

        String correo = request.correo()
                .trim()
                .toLowerCase(Locale.ROOT);

        if (request.contrasena()
                .getBytes(StandardCharsets.UTF_8).length > 72) {

            throw new BadCredentialsException(
                    "Credenciales incorrectas");
        }

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        correo,
                        request.contrasena())
        );

        return usuarioService.obtenerPorCorreo(correo);
    }

    private LoginResponse generarRespuesta(Usuario usuario) {

        String token = jwtService.generarToken(usuario);

        return new LoginResponse(
                token,
                "Bearer",
                usuarioService.convertirResponse(usuario)
        );
    }

    public UsuarioResponse obtenerPerfil(Long usuarioId) {

        return usuarioService.buscarPorId(usuarioId);
    }
}