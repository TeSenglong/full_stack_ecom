package com.example.backend;

import com.example.backend.dto.CategoryRequest;
import com.example.backend.dto.CategoryResponse;
import com.example.backend.model.AppUser;
import com.example.backend.model.UserRole;
import com.example.backend.repository.AppUserRepository;
import com.example.backend.repository.CategoryRepository;
import com.example.backend.repository.ProductRepository;
import com.example.backend.service.CategoryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.http.HttpHeaders;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthSecurityIntegrationTests {

    private static final String EMAIL = "user@example.com";
    private static final String PASSWORD = "correct-password-123";
    private static final Pattern ACCESS_TOKEN_PATTERN =
            Pattern.compile("\\\"accessToken\\\":\\\"([^\\\"]+)\\\"");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AppUserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtDecoder jwtDecoder;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @BeforeEach
    void cleanDatabase() {
        productRepository.deleteAll();
        categoryRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void registrationCreatesUserWithUserRoleAndBcryptPassword() throws Exception {
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerJson(EMAIL, "Test User", PASSWORD)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value(EMAIL))
                .andExpect(jsonPath("$.displayName").value("Test User"))
                .andExpect(jsonPath("$.role").value("USER"))
                .andExpect(jsonPath("$.passwordHash").doesNotExist());

        AppUser savedUser = userRepository.findByEmailIgnoreCase(EMAIL).orElseThrow();

        assertEquals(UserRole.USER, savedUser.getRole());
        assertNotEquals(PASSWORD, savedUser.getPasswordHash());
        assertTrue(savedUser.getPasswordHash().startsWith("$2"));
        assertTrue(passwordEncoder.matches(PASSWORD, savedUser.getPasswordHash()));
    }

    @Test
    void duplicateEmailIsRejectedIgnoringLetterCase() throws Exception {
        register(EMAIL);

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerJson("USER@EXAMPLE.COM", "Another User", PASSWORD)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message")
                        .value("An account with this email already exists"));

        assertEquals(1, userRepository.count());
    }

    @Test
    void correctLoginReturnsAValidJwt() throws Exception {
        AppUser user = register(EMAIL);

        String token = loginAndGetToken(EMAIL, PASSWORD);
        Jwt jwt = jwtDecoder.decode(token);

        assertEquals(user.getId().toString(), jwt.getSubject());
        assertEquals("ecom-backend-test", jwt.getClaimAsString("iss"));
        assertTrue(jwt.getAudience().contains("ecom-api"));
        assertEquals(EMAIL, jwt.getClaimAsString("email"));
        assertTrue(jwt.getExpiresAt().isAfter(jwt.getIssuedAt()));
    }

    @Test
    void incorrectPasswordReturnsUnauthorized() throws Exception {
        register(EMAIL);

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson(EMAIL, "incorrect-password")))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid credentials"));
    }

    @Test
    void guestCannotCreateAProduct() throws Exception {
        mockMvc.perform(post("/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(productJson(1L)))
                .andExpect(status().isUnauthorized())
                .andExpect(header().string(HttpHeaders.WWW_AUTHENTICATE, "Bearer"))
                .andExpect(jsonPath("$.timestamp").isNotEmpty())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("Unauthorized"))
                .andExpect(jsonPath("$.message").value("Authentication is required"))
                .andExpect(jsonPath("$.path").value("/products"));
    }

    @Test
    void invalidBearerTokenReturnsConsistentUnauthorizedResponse() throws Exception {
        mockMvc.perform(post("/products")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer not-a-valid-jwt")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(productJson(1L)))
                .andExpect(status().isUnauthorized())
                .andExpect(header().string(HttpHeaders.WWW_AUTHENTICATE, "Bearer"))
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("Unauthorized"))
                .andExpect(jsonPath("$.message").value("Authentication is required"))
                .andExpect(jsonPath("$.path").value("/products"));
    }

    @Test
    void userCannotCreateAProduct() throws Exception {
        register(EMAIL);
        String token = loginAndGetToken(EMAIL, PASSWORD);
        CategoryResponse category = categoryService.create(
                new CategoryRequest("Books", "All books")
        );

        mockMvc.perform(post("/products")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(productJson(category.id())))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.timestamp").isNotEmpty())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.error").value("Forbidden"))
                .andExpect(jsonPath("$.message")
                        .value("You do not have permission to perform this action"))
                .andExpect(jsonPath("$.path").value("/products"));

        assertEquals(0, productRepository.count());
    }

    @Test
    void adminCanCreateAProduct() throws Exception {
        register(EMAIL);
        setRole(EMAIL, UserRole.ADMIN);
        String token = loginAndGetToken(EMAIL, PASSWORD);
        CategoryResponse category = categoryService.create(
                new CategoryRequest("Books", "All books")
        );

        mockMvc.perform(post("/products")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(productJson(category.id())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Security Test Product"));

        assertEquals(1, productRepository.count());
    }

    @Test
    void disabledUserCannotLogInOrUseAnExistingJwt() throws Exception {
        register(EMAIL);
        setRole(EMAIL, UserRole.ADMIN);
        String existingToken = loginAndGetToken(EMAIL, PASSWORD);
        disableUser(EMAIL);

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson(EMAIL, PASSWORD)))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/products")
                        .header("Authorization", "Bearer " + existingToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(productJson(1L)))
                .andExpect(status().isUnauthorized());

        AppUser disabledUser = userRepository.findByEmailIgnoreCase(EMAIL).orElseThrow();
        assertFalse(disabledUser.isEnabled());
    }

    @Test
    void configuredOriginCanPreflightOrderStatusPatch() throws Exception {
        mockMvc.perform(options("/orders/1/status")
                        .header(HttpHeaders.ORIGIN, "http://localhost:3000")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "PATCH"))
                .andExpect(status().isOk())
                .andExpect(header().string(
                        HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN,
                        "http://localhost:3000"
                ))
                .andExpect(header().string(
                        HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS,
                        containsString("PATCH")
                ));
    }

    @Test
    void unconfiguredOriginIsRejected() throws Exception {
        mockMvc.perform(options("/cart")
                        .header(HttpHeaders.ORIGIN, "https://malicious.example")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "GET"))
                .andExpect(status().isForbidden())
                .andExpect(header().doesNotExist(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN));
    }

    private AppUser register(String email) throws Exception {
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerJson(email, "Test User", PASSWORD)))
                .andExpect(status().isCreated());

        return userRepository.findByEmailIgnoreCase(email).orElseThrow();
    }

    private String loginAndGetToken(String email, String password) throws Exception {
        MvcResult result = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson(email, password)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andReturn();

        Matcher matcher = ACCESS_TOKEN_PATTERN.matcher(
                result.getResponse().getContentAsString()
        );
        assertTrue(matcher.find(), "The login response must contain an access token");
        return matcher.group(1);
    }

    private void setRole(String email, UserRole role) {
        int changedRows = jdbcTemplate.update(
                "UPDATE users SET role = ? WHERE email = ?",
                role.name(),
                email
        );
        assertEquals(1, changedRows);
    }

    private void disableUser(String email) {
        int changedRows = jdbcTemplate.update(
                "UPDATE users SET enabled = false WHERE email = ?",
                email
        );
        assertEquals(1, changedRows);
    }

    private String registerJson(String email, String displayName, String password) {
        return """
                {
                  "email": "%s",
                  "displayName": "%s",
                  "password": "%s"
                }
                """.formatted(email, displayName, password);
    }

    private String loginJson(String email, String password) {
        return """
                {
                  "email": "%s",
                  "password": "%s"
                }
                """.formatted(email, password);
    }

    private String productJson(Long categoryId) {
        return """
                {
                  "name": "Security Test Product",
                  "description": "Created by an authorization test",
                  "price": 19.99,
                  "discountPrice": null,
                  "stockQuantity": 3,
                  "imageUrl": "https://example.com/security-test.jpg",
                  "brand": "Example",
                  "releaseDate": "2026-04-18",
                  "categoryId": %d
                }
                """.formatted(categoryId);
    }
}
