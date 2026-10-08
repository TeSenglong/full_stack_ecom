package com.example.backend.dto.account;

import jakarta.validation.constraints.NotBlank;

public record DeactivateAccountRequest(
        @NotBlank(message = "password is required") String password
) {
}
