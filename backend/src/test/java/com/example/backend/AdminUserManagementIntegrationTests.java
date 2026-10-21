package com.example.backend;

import com.example.backend.model.AppUser;
import com.example.backend.model.UserRole;
import com.example.backend.repository.AppUserRepository;
import com.example.backend.service.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminUserManagementIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AppUserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @BeforeEach
    void cleanUsers() {
        userRepository.deleteAll();
    }

    @Test
    void administratorCanSearchAndFilterUsers() throws Exception {
        AppUser admin = createUser("admin@example.com", "Store Admin", UserRole.ADMIN);
        createUser("customer@example.com", "Customer One", UserRole.USER);

        mockMvc.perform(get("/admin/users")
                        .header("Authorization", bearer(admin))
                        .queryParam("query", "customer")
                        .queryParam("role", "USER")
                        .queryParam("enabled", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalContents").value(1))
                .andExpect(jsonPath("$.content[0].email").value("customer@example.com"))
                .andExpect(jsonPath("$.content[0].role").value("USER"))
                .andExpect(jsonPath("$.content[0].enabled").value(true))
                .andExpect(jsonPath("$.content[0].passwordHash").doesNotExist());
    }

    @Test
    void administratorCanChangeRoleAndDisableAUser() throws Exception {
        AppUser admin = createUser("admin@example.com", "Store Admin", UserRole.ADMIN);
        AppUser customer = createUser("customer@example.com", "Customer One", UserRole.USER);
        String customerToken = bearer(customer);

        mockMvc.perform(patch("/admin/users/{id}/role", customer.getId())
                        .header("Authorization", bearer(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"role\":\"STAFF\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("STAFF"));

        mockMvc.perform(patch("/admin/users/{id}/enabled", customer.getId())
                        .header("Authorization", bearer(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"enabled\":false}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.enabled").value(false));

        AppUser changedUser = userRepository.findById(customer.getId()).orElseThrow();
        assertEquals(UserRole.STAFF, changedUser.getRole());
        assertFalse(changedUser.isEnabled());

        mockMvc.perform(get("/account")
                        .header("Authorization", customerToken))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void administratorCannotDemoteOrDisableThemselves() throws Exception {
        AppUser admin = createUser("admin@example.com", "Store Admin", UserRole.ADMIN);
        String token = bearer(admin);

        mockMvc.perform(patch("/admin/users/{id}/role", admin.getId())
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"role\":\"USER\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message")
                        .value("You cannot remove your own administrator role"));

        mockMvc.perform(patch("/admin/users/{id}/enabled", admin.getId())
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"enabled\":false}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message")
                        .value("You cannot disable your own account"));
    }

    @Test
    void regularUserCannotAccessAdminUserManagement() throws Exception {
        AppUser customer = createUser("customer@example.com", "Customer One", UserRole.USER);

        mockMvc.perform(get("/admin/users")
                        .header("Authorization", bearer(customer)))
                .andExpect(status().isForbidden());
    }

    private AppUser createUser(String email, String displayName, UserRole role) {
        AppUser user = new AppUser(
                email,
                passwordEncoder.encode("correct-password-123"),
                displayName
        );
        user.setRole(role);
        return userRepository.saveAndFlush(user);
    }

    private String bearer(AppUser user) {
        return "Bearer " + jwtService.issueAccessToken(user).value();
    }
}
