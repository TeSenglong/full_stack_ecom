package com.example.backend.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(ResourceNotFoundException.class)
	public ResponseEntity<ApiError> handleNotFound(
			ResourceNotFoundException exception,
			HttpServletRequest request
	) {
		return buildError(HttpStatus.NOT_FOUND, exception.getMessage(), request, null);
	}

	@ExceptionHandler(BadRequestException.class)
	public ResponseEntity<ApiError> handleBadRequest(
			BadRequestException exception,
			HttpServletRequest request
	) {
		return buildError(HttpStatus.BAD_REQUEST, exception.getMessage(), request, null);
	}

	@ExceptionHandler(AuthenticationException.class)
	public ResponseEntity<ApiError> handleAuthentication(
			AuthenticationException exception,
			HttpServletRequest request
	) {
		return buildError(HttpStatus.UNAUTHORIZED, "Invalid credentials", request, null);
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ApiError> handleValidation(
			MethodArgumentNotValidException exception,
			HttpServletRequest request
	) {
		Map<String, String> validationErrors = new LinkedHashMap<>();
		exception.getBindingResult().getFieldErrors().forEach(error ->
				validationErrors.putIfAbsent(error.getField(), error.getDefaultMessage())
		);
		return buildError(HttpStatus.BAD_REQUEST, "Request validation failed", request, validationErrors);
	}

	@ExceptionHandler(DataIntegrityViolationException.class)
	public ResponseEntity<ApiError> handleConflict(
			DataIntegrityViolationException exception,
			HttpServletRequest request
	) {
		return buildError(
				HttpStatus.CONFLICT,
				"The operation conflicts with existing database data",
				request,
				null
		);
	}

	@ExceptionHandler(OptimisticLockingFailureException.class)
	public ResponseEntity<ApiError> handleOptimisticLock(
			OptimisticLockingFailureException exception,
			HttpServletRequest request
	) {
		return buildError(
				HttpStatus.CONFLICT,
				"The resource was changed by another request; reload it and try again",
				request,
				null
		);
	}

	@ExceptionHandler(StorageUnavailableException.class)
	public ResponseEntity<ApiError> handleStorageUnavailable(
			StorageUnavailableException exception,
			HttpServletRequest request
	) {
		return buildError(HttpStatus.SERVICE_UNAVAILABLE, exception.getMessage(), request, null);
	}

	@ExceptionHandler(StorageOperationException.class)
	public ResponseEntity<ApiError> handleStorageOperation(
			StorageOperationException exception,
			HttpServletRequest request
	) {
		return buildError(HttpStatus.BAD_GATEWAY, exception.getMessage(), request, null);
	}

	@ExceptionHandler(MaxUploadSizeExceededException.class)
	public ResponseEntity<ApiError> handleMaximumUploadSize(
			MaxUploadSizeExceededException exception,
			HttpServletRequest request
	) {
		return buildError(
				HttpStatus.CONTENT_TOO_LARGE,
				"Uploaded image exceeds the maximum upload size",
				request,
				null
		);
	}

	private ResponseEntity<ApiError> buildError(
			HttpStatus status,
			String message,
			HttpServletRequest request,
			Map<String, String> validationErrors
	) {
		ApiError error = new ApiError(
				Instant.now(),
				status.value(),
				status.getReasonPhrase(),
				message,
				request.getRequestURI(),
				validationErrors
		);
		return ResponseEntity.status(status).body(error);
	}
}
