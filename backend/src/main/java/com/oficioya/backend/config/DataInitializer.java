package com.oficioya.backend.config;

import com.oficioya.backend.entity.Categoria;
import com.oficioya.backend.entity.Usuario;
import com.oficioya.backend.enums.Rol;
import com.oficioya.backend.repository.CategoriaRepository;
import com.oficioya.backend.repository.UsuarioRepository;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Locale;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final CategoriaRepository categoriaRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${ADMIN_EMAIL:}")
    private String adminEmail;

    @Value("${ADMIN_PASSWORD:}")
    private String adminPassword;

    public DataInitializer(
            UsuarioRepository usuarioRepository,
            CategoriaRepository categoriaRepository,
            PasswordEncoder passwordEncoder) {

        this.usuarioRepository = usuarioRepository;
        this.categoriaRepository = categoriaRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {

        crearAdministrador();
        crearCategorias();
    }

    private void crearAdministrador() {

        if (adminEmail.isBlank() || adminPassword.isBlank()) {
            return;
        }

        String correo = adminEmail.trim()
                .toLowerCase(Locale.ROOT);

        if (usuarioRepository.existsByCorreo(correo)) {
            return;
        }

        if (adminPassword.length() < 12
                || adminPassword.getBytes(
                        StandardCharsets.UTF_8).length > 72) {

            throw new IllegalArgumentException(
                    "La contraseña del administrador no es válida");
        }

        Usuario admin = new Usuario();

        admin.setNombres("Administrador");
        admin.setApellidos("OficioYA");
        admin.setCorreo(correo);
        admin.setContrasena(
                passwordEncoder.encode(adminPassword));
        admin.setRol(Rol.ADMIN);
        admin.setActivo(true);

        usuarioRepository.save(admin);
    }

    private void crearCategorias() {

        List<String> categorias = List.of(
                "Electricidad",
                "Gasfitería",
                "Carpintería",
                "Albañilería",
                "Pintura",
                "Mecánica",
                "Refrigeración",
                "Soporte técnico",
                "Limpieza",
                "Jardinería"
        );

        for (String nombre : categorias) {

            if (!categoriaRepository.existsByNombreIgnoreCase(nombre)) {

                Categoria categoria = new Categoria();

                categoria.setNombre(nombre);
                categoria.setDescripcion(
                        "Servicios profesionales de " + nombre);
                categoria.setActivo(true);

                categoriaRepository.save(categoria);
            }
        }
    }
}