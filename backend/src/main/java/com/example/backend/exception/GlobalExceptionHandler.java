package com.example.backend.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpHeaders;
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

	// 404 Not Found Thrown when an entity (e.g., product, category, user) does not
	// exist.
	@ExceptionHandler(ResourceNotFoundException.class)
	public ResponseEntity<ApiError> handleNotFound(
			ResourceNotFoundException exception,
			HttpServletRequest request) {
		return buildError(HttpStatus.NOT_FOUND, exception.getMessage(), request, null);
	}

	// 400 Bad Request Thrown for general client errors or invalid business logic
	// requests.
	@ExceptionHandler(BadRequestException.class)
	public ResponseEntity<ApiError> handleBadRequest(
			BadRequestException exception,
			HttpServletRequest request) {
		return buildError(HttpStatus.BAD_REQUEST, exception.getMessage(), request, null);
	}

	// 401 Unauthorized Spring Security exception; masks internal details and
	// returns "Invalid credentials".
	@ExceptionHandler(AuthenticationException.class)
	public ResponseEntity<ApiError> handleAuthentication(
			AuthenticationException exception,
			HttpServletRequest request) {
		return buildError(HttpStatus.UNAUTHORIZED, "Invalid credentials", request, null);
	}

	// 429 Too Many Requests Thrown when rate limits are exceeded.
	// Crucially adds the HTTP header Retry-After: <seconds> indicating when the
	// client may retry.
	@ExceptionHandler(RateLimitExceededException.class)
	public ResponseEntity<ApiError> handleRateLimit(
			RateLimitExceededException exception,
			HttpServletRequest request) {
		ApiError error = new ApiError(
				Instant.now(),
				HttpStatus.TOO_MANY_REQUESTS.value(),
				HttpStatus.TOO_MANY_REQUESTS.getReasonPhrase(),
				exception.getMessage(),
				request.getRequestURI(),
				null);

		return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
				.header(
						HttpHeaders.RETRY_AFTER,
						Long.toString(exception.getRetryAfterSeconds()))
				.body(error);
	}

	// 400 Bad Request Triggered when request bodies fail @Valid / Bean Validation
	// annotations.
	// Extracts field names and error messages into validationErrors map (e.g.
	// {"price": "must be greater than 0"}).
	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ApiError> handleValidation(
			MethodArgumentNotValidException exception,
			HttpServletRequest request) {
		Map<String, String> validationErrors = new LinkedHashMap<>();
		exception.getBindingResult().getFieldErrors()
				.forEach(error -> validationErrors.putIfAbsent(error.getField(), error.getDefaultMessage()));
		return buildError(HttpStatus.BAD_REQUEST, "Request validation failed", request, validationErrors);
	}

	// 409 Conflict Thrown by Spring Data/Hibernate when a database constraint fails
	// (e.g., duplicate unique email/SKU, foreign key violation).
	@ExceptionHandler(DataIntegrityViolationException.class)
	public ResponseEntity<ApiError> handleConflict(
			DataIntegrityViolationException exception,
			HttpServletRequest request) {
		return buildError(
				HttpStatus.CONFLICT,
				"The operation conflicts with existing database data",
				request,
				null);
	}

	// 409 Conflict Thrown when concurrent updates collide
	// (e.g., two users modifying the same entity version at the same time).
	@ExceptionHandler(OptimisticLockingFailureException.class)
	public ResponseEntity<ApiError> handleOptimisticLock(
			OptimisticLockingFailureException exception,
			HttpServletRequest request) {
		return buildError(
				HttpStatus.CONFLICT,
				"The resource was changed by another request; reload it and try again",
				request,
				null);
	}

	// 503 Service Unavailable Custom exception indicating cloud storage
	// (e.g., Supabase S3) is unreachable.
	@ExceptionHandler(StorageUnavailableException.class)
	public ResponseEntity<ApiError> handleStorageUnavailable(
			StorageUnavailableException exception,
			HttpServletRequest request) {
		return buildError(HttpStatus.SERVICE_UNAVAILABLE, exception.getMessage(), request, null);
	}

	// 502 Bad Gateway Custom exception indicating an error occurred during an S3
	// storage operation (e.g., upload/delete failure).
	@ExceptionHandler(StorageOperationException.class)
	public ResponseEntity<ApiError> handleStorageOperation(
			StorageOperationException exception,
			HttpServletRequest request) {
		return buildError(HttpStatus.BAD_GATEWAY, exception.getMessage(), request, null);
	}

	// 413 Content Too Large Triggered when a multipart file upload exceeds Spring
	// Boot's configured upload size limits.
	@ExceptionHandler(MaxUploadSizeExceededException.class)
	public ResponseEntity<ApiError> handleMaximumUploadSize(
			MaxUploadSizeExceededException exception,
			HttpServletRequest request) {
		return buildError(
				HttpStatus.CONTENT_TOO_LARGE,
				"Uploaded image exceeds the maximum upload size",
				request,
				null);
	}

	private ResponseEntity<ApiError> buildError(
			HttpStatus status,
			String message,
			HttpServletRequest request,
			Map<String, String> validationErrors) {
		ApiError error = new ApiError(
				Instant.now(),
				status.value(),
				status.getReasonPhrase(),
				message,
				request.getRequestURI(),
				validationErrors);
		return ResponseEntity.status(status).body(error);
	}
}
// {
// "timestamp": "2026-10-14T11:46:28.123Z",
// "status": 400,
// "error": "Bad Request",
// "message": "Request validation failed",
// "path": "/api/v1/products",
// "validationErrors": {
// "name": "Name cannot be blank"
// }
// }
