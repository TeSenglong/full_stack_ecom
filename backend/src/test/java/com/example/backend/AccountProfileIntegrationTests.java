package com.example.backend;

import com.example.backend.model.AppUser;
import com.example.backend.model.UserRole;
import com.example.backend.repository.AppUserRepository;
import com.example.backend.service.AvatarStorage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Primary;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(AccountProfileIntegrationTests.StorageTestConfig.class)
class AccountProfileIntegrationTests {

    private static final String PASSWORD = "correct-password-123";
    private static final Pattern ACCESS_TOKEN_PATTERN =
            Pattern.compile("\\\"accessToken\\\":\\\"([^\\\"]+)\\\"");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AppUserRepository userRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private FakeAvatarStorage avatarStorage;

    @BeforeEach
    void cleanDatabase() {
        userRepository.deleteAll();
        avatarStorage.reset();
    }

    @Test
    void guestCannotAccessProfileOrUploadAvatar() throws Exception {
        mockMvc.perform(get("/account"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(multipart("/account/avatar")
                        .file(pngFile("avatar.png")))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(patch("/account/deactivate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"password\":\"anything\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void userCanReadProfileAndManageOnlyTheirOwnAvatar() throws Exception {
        AppUser user = register("profile-user@example.com");
        AppUser otherUser = register("other-user@example.com");
        String token = loginAndGetToken(user.getEmail());

        mockMvc.perform(get("/account")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(user.getId()))
                .andExpect(jsonPath("$.role").value("USER"))
                .andExpect(jsonPath("$.avatarUrl").doesNotExist());

        MvcResult firstUpload = mockMvc.perform(multipart("/account/avatar")
                        .file(pngFile("first.png"))
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(user.getId()))
                .andExpect(jsonPath("$.avatarUrl").isNotEmpty())
                .andReturn();

        String firstKey = userRepository.findById(user.getId()).orElseThrow().getAvatarObjectKey();
        assertTrue(firstUpload.getResponse().getContentAsString().contains(firstKey));
        assertNull(userRepository.findById(otherUser.getId()).orElseThrow().getAvatarUrl());

        mockMvc.perform(multipart("/account/avatar")
                        .file(pngFile("replacement.png"))
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk());

        String replacementKey = userRepository.findById(user.getId()).orElseThrow().getAvatarObjectKey();
        assertTrue(avatarStorage.deletedKeys().contains(firstKey));

        mockMvc.perform(delete("/account/avatar")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.avatarUrl").doesNotExist());

        AppUser updatedUser = userRepository.findById(user.getId()).orElseThrow();
        assertNull(updatedUser.getAvatarUrl());
        assertNull(updatedUser.getAvatarObjectKey());
        assertTrue(avatarStorage.deletedKeys().contains(replacementKey));
    }

    @Test
    void adminCanManageTheirOwnAvatar() throws Exception {
        AppUser admin = register("profile-admin@example.com");
        setRole(admin.getEmail(), UserRole.ADMIN);
        String token = loginAndGetToken(admin.getEmail());

        mockMvc.perform(multipart("/account/avatar")
                        .file(pngFile("admin.png"))
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(admin.getId()))
                .andExpect(jsonPath("$.role").value("ADMIN"))
                .andExpect(jsonPath("$.avatarUrl").isNotEmpty());
    }

    @Test
    void userMustConfirmPasswordToDeactivateAccount() throws Exception {
        AppUser user = register("deactivate-password@example.com");
        String token = loginAndGetToken(user.getEmail());

        mockMvc.perform(patch("/account/deactivate")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"password\":\"wrong-password\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Password is incorrect"));

        assertTrue(userRepository.findById(user.getId()).orElseThrow().isEnabled());
    }

    @Test
    void userCanDeactivateAccountAndExistingTokenStopsWorking() throws Exception {
        AppUser user = register("deactivate-user@example.com");
        String token = loginAndGetToken(user.getEmail());

        mockMvc.perform(patch("/account/deactivate")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"password\":\"" + PASSWORD + "\"}"))
                .andExpect(status().isNoContent());

        assertFalse(userRepository.findById(user.getId()).orElseThrow().isEnabled());

        mockMvc.perform(get("/account")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "%s",
                                  "password": "%s"
                                }
                                """.formatted(user.getEmail(), PASSWORD)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void administratorCannotDeactivateFromStorefront() throws Exception {
        AppUser admin = register("deactivate-admin@example.com");
        setRole(admin.getEmail(), UserRole.ADMIN);
        String token = loginAndGetToken(admin.getEmail());

        mockMvc.perform(patch("/account/deactivate")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"password\":\"" + PASSWORD + "\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(
                        "Administrator accounts cannot be deactivated from the storefront"
                ));

        assertTrue(userRepository.findById(admin.getId()).orElseThrow().isEnabled());
    }

    private AppUser register(String email) throws Exception {
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "%s",
                                  "displayName": "Profile Test",
                                  "password": "%s"
                                }
                                """.formatted(email, PASSWORD)))
                .andExpect(status().isCreated());

        return userRepository.findByEmailIgnoreCase(email).orElseThrow();
    }

    private String loginAndGetToken(String email) throws Exception {
        MvcResult result = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "%s",
                                  "password": "%s"
                                }
                                """.formatted(email, PASSWORD)))
                .andExpect(status().isOk())
                .andReturn();

        Matcher matcher = ACCESS_TOKEN_PATTERN.matcher(result.getResponse().getContentAsString());
        assertTrue(matcher.find());
        return matcher.group(1);
    }

    private void setRole(String email, UserRole role) {
        assertEquals(1, jdbcTemplate.update(
                "UPDATE users SET role = ? WHERE email = ?",
                role.name(),
                email
        ));
    }

    private MockMultipartFile pngFile(String name) {
        return new MockMultipartFile(
                "file",
                name,
                MediaType.IMAGE_PNG_VALUE,
                new byte[] {(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 1, 2, 3}
        );
    }

    @TestConfiguration(proxyBeanMethods = false)
    static class StorageTestConfig {

        @Bean
        @Primary
        FakeAvatarStorage fakeAvatarStorage() {
            return new FakeAvatarStorage();
        }
    }

    static final class FakeAvatarStorage implements AvatarStorage {

        private final AtomicInteger sequence = new AtomicInteger();
        private final List<String> deletedKeys = new ArrayList<>();

        @Override
        public StoredAvatar upload(Long userId, MultipartFile file) {
            String key = "users/" + userId + "/avatar-" + sequence.incrementAndGet() + ".png";
            return new StoredAvatar("https://cdn.example/profile-images/" + key, key);
        }

        @Override
        public void delete(String objectKey) {
            deletedKeys.add(objectKey);
        }

        List<String> deletedKeys() {
            return List.copyOf(deletedKeys);
        }

        void reset() {
            sequence.set(0);
            deletedKeys.clear();
        }
    }
}
