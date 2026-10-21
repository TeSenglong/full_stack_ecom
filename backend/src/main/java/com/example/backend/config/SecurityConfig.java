package com.example.backend.config;

import com.example.backend.exception.ApiError;
import com.example.backend.service.AppJwtAuthenticationConverter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.SecurityFilterChain;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    AuthenticationManager authenticationManager(
            UserDetailsService userDetailsService,
            PasswordEncoder passwordEncoder
    ) {
        DaoAuthenticationProvider provider =
                new DaoAuthenticationProvider(userDetailsService);

        provider.setPasswordEncoder(passwordEncoder);

        return new ProviderManager(List.of(provider));
    }

    @Bean
    AuthenticationEntryPoint apiAuthenticationEntryPoint(
            ObjectMapper objectMapper
    ) {
        return (request, response, exception) -> {
            response.setHeader(HttpHeaders.WWW_AUTHENTICATE, "Bearer");
            writeSecurityError(
                    objectMapper,
                    request,
                    response,
                    HttpStatus.UNAUTHORIZED,
                    "Authentication is required"
            );
        };
    }

    @Bean
    AccessDeniedHandler apiAccessDeniedHandler(ObjectMapper objectMapper) {
        return (request, response, exception) -> writeSecurityError(
                objectMapper,
                request,
                response,
                HttpStatus.FORBIDDEN,
                "You do not have permission to perform this action"
        );
    }

    @Bean
    SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            AppJwtAuthenticationConverter jwtAuthenticationConverter,
            AuthenticationEntryPoint apiAuthenticationEntryPoint,
            AccessDeniedHandler apiAccessDeniedHandler
    ) throws Exception {
        return http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                .httpBasic(httpBasic -> httpBasic.disable())
                .formLogin(formLogin -> formLogin.disable())
                .logout(logout -> logout.disable())
                .sessionManagement(session -> session
                        .sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint(apiAuthenticationEntryPoint)
                        .accessDeniedHandler(apiAccessDeniedHandler)
                )
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers(
                                HttpMethod.OPTIONS,
                                "/**"
                        ).permitAll()

                        .requestMatchers(
                                HttpMethod.POST,
                                "/auth/register",
                                "/auth/login"
                        ).permitAll()

                        .requestMatchers(
                                HttpMethod.GET,
                                "/products",
                                "/products/**",
                                "/categories",
                                "/categories/**"
                        ).permitAll()

                        .requestMatchers(
                                "/admin/**"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.POST,
                                "/products",
                                "/products/**",
                                "/categories",
                                "/categories/**"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/products/**",
                                "/categories/**"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.PATCH,
                                "/products/**",
                                "/categories/**"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/products/**",
                                "/categories/**"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.GET,
                                "/orders/admin",
                                "/orders/admin/**"
                        ).hasAnyRole("STAFF", "ADMIN")

                        .requestMatchers(
                                HttpMethod.PATCH,
                                "/orders/*/status"
                        ).hasAnyRole("STAFF", "ADMIN")

                        .requestMatchers(
                                "/account",
                                "/account/**",
                                "/cart",
                                "/cart/**",
                                "/orders",
                                "/orders/**"
                        ).hasAnyRole("USER", "STAFF", "ADMIN")

                        .requestMatchers("/error").permitAll()

                        .anyRequest().denyAll()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .authenticationEntryPoint(apiAuthenticationEntryPoint)
                        .accessDeniedHandler(apiAccessDeniedHandler)
                        .jwt(jwt -> jwt
                                .jwtAuthenticationConverter(
                                        jwtAuthenticationConverter
                                )
                        )
                )
                .build();
    }

    private static void writeSecurityError(
            ObjectMapper objectMapper,
            HttpServletRequest request,
            HttpServletResponse response,
            HttpStatus status,
            String message
    ) throws IOException {
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        objectMapper.writeValue(
                response.getOutputStream(),
                new ApiError(
                        Instant.now(),
                        status.value(),
                        status.getReasonPhrase(),
                        message,
                        request.getRequestURI(),
                        null
                )
        );
    }
}
