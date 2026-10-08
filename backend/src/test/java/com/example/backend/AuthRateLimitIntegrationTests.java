package com.example.backend;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.matchesPattern;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "app.security.rate-limit.enabled=true",
        "app.security.rate-limit.login.per-identity-capacity=2",
        "app.security.rate-limit.login.global-capacity=100",
        "app.security.rate-limit.login.period=PT1M",
        "app.security.rate-limit.registration.per-identity-capacity=2",
        "app.security.rate-limit.registration.global-capacity=100",
        "app.security.rate-limit.registration.period=PT1H"
})
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthRateLimitIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void loginReturnsTooManyRequestsAfterConfiguredLimit() throws Exception {
        String request = loginJson("limited-login@example.com");

        for (int attempt = 0; attempt < 2; attempt++) {
            mockMvc.perform(post("/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(request))
                    .andExpect(status().isUnauthorized());
        }

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request))
                .andExpect(status().isTooManyRequests())
                .andExpect(header().string(
                        HttpHeaders.RETRY_AFTER,
                        matchesPattern("[1-9][0-9]*")
                ))
                .andExpect(jsonPath("$.status").value(429))
                .andExpect(jsonPath("$.message").value(
                        "Too many login attempts for this account. Try again later."
                ));
    }

    @Test
    void registrationReturnsTooManyRequestsAfterConfiguredLimit() throws Exception {
        String request = registerJson("limited-registration@example.com");

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request))
                .andExpect(status().isBadRequest());

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request))
                .andExpect(status().isTooManyRequests())
                .andExpect(header().string(
                        HttpHeaders.RETRY_AFTER,
                        matchesPattern("[1-9][0-9]*")
                ))
                .andExpect(jsonPath("$.status").value(429))
                .andExpect(jsonPath("$.message").value(
                        "Too many registration attempts for this email. Try again later."
                ));
    }

    private String loginJson(String email) {
        return """
                {
                  "email": "%s",
                  "password": "incorrect-password"
                }
                """.formatted(email);
    }

    private String registerJson(String email) {
        return """
                {
                  "email": "%s",
                  "displayName": "Limited User",
                  "password": "correct-password-123"
                }
                """.formatted(email);
    }
}
