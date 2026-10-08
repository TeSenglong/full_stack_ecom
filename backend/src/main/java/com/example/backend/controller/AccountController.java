package com.example.backend.controller;

import com.example.backend.dto.account.DeactivateAccountRequest;
import com.example.backend.dto.auth.UserResponse;
import com.example.backend.service.AccountService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/account")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @GetMapping
    public UserResponse getProfile(@AuthenticationPrincipal Jwt jwt) {
        return accountService.getProfile(getUserId(jwt));
    }

    @PostMapping(value = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public UserResponse uploadAvatar(
            @AuthenticationPrincipal Jwt jwt,
            @RequestPart("file") MultipartFile file
    ) {
        return accountService.uploadAvatar(getUserId(jwt), file);
    }

    @DeleteMapping("/avatar")
    public UserResponse deleteAvatar(@AuthenticationPrincipal Jwt jwt) {
        return accountService.deleteAvatar(getUserId(jwt));
    }

    @PatchMapping("/deactivate")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deactivateAccount(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody DeactivateAccountRequest request
    ) {
        accountService.deactivateAccount(getUserId(jwt), request.password());
    }

    private Long getUserId(Jwt jwt) {
        return Long.valueOf(jwt.getSubject());
    }
}
