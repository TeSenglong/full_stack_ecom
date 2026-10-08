package com.example.backend.service;

import com.example.backend.model.AppUser;
import com.example.backend.repository.AppUserRepository;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class AppJwtAuthenticationConverter
        implements Converter<Jwt, AbstractAuthenticationToken> {

    private final AppUserRepository userRepository;

    public AppJwtAuthenticationConverter(
            AppUserRepository userRepository
    ) {
        this.userRepository = userRepository;
    }

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        Long userId;

        try {
            userId = Long.valueOf(jwt.getSubject());
        } catch (RuntimeException exception) {
            throw new BadCredentialsException("Invalid token subject");
        }

        AppUser user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new BadCredentialsException("User no longer exists")
                );

        if (!user.isEnabled()) {
            throw new DisabledException("Account is disabled");
        }

        SimpleGrantedAuthority authority =
                new SimpleGrantedAuthority(
                        "ROLE_" + user.getRole().name()
                );

        return new JwtAuthenticationToken(
                jwt,
                List.of(authority),
                user.getEmail()
        );
    }
}