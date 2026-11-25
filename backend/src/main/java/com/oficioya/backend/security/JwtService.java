package com.oficioya.backend.security;

import com.oficioya.backend.entity.Usuario;
import java.time.Instant;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private final JwtEncoder jwtEncoder;
    private final long expiracion;
    private final String issuer;

    public JwtService(
            JwtEncoder jwtEncoder,
            @Value("${app.jwt.expiration}") long expiracion,
            @Value("${app.jwt.issuer}") String issuer) {

        this.jwtEncoder = jwtEncoder;
        this.expiracion = expiracion;
        this.issuer = issuer;
    }

    public String generarToken(Usuario usuario) {

        Instant ahora = Instant.now();

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(issuer)
                .issuedAt(ahora)
                .expiresAt(ahora.plusSeconds(expiracion))
                .subject(usuario.getId().toString())
                .claim("correo", usuario.getCorreo())
                .claim("rol", usuario.getRol().name())
                .build();

        JwsHeader header = JwsHeader
                .with(MacAlgorithm.HS256)
                .build();

        return jwtEncoder.encode(
                JwtEncoderParameters.from(header, claims)
        ).getTokenValue();
    }
}