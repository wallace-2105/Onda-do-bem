package com.ondadobem.api.exception

import com.ondadobem.api.dto.ApiError
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.AccessDeniedException
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.validation.FieldError
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import org.springframework.web.server.ResponseStatusException

@RestControllerAdvice
class GlobalExceptionHandler {

    @ExceptionHandler(ResponseStatusException::class)
    fun handleResponseStatusException(ex: ResponseStatusException): ResponseEntity<ApiError> {
        val status = HttpStatus.resolve(ex.statusCode.value()) ?: HttpStatus.INTERNAL_SERVER_ERROR
        val error = ApiError(
            statusCode = status.value(),
            message = ex.reason ?: status.reasonPhrase,
            error = status.reasonPhrase
        )
        return ResponseEntity.status(status).body(error)
    }

    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleValidationException(ex: MethodArgumentNotValidException): ResponseEntity<ApiError> {
        val details = mutableMapOf<String, MutableList<String>>()

        ex.bindingResult.allErrors.forEach { error ->
            val fieldName = (error as? FieldError)?.field ?: "geral"
            val errorMessage = error.defaultMessage ?: "Valor inválido"
            details.computeIfAbsent(fieldName) { mutableListOf() }.add(errorMessage)
        }

        val error = ApiError(
            statusCode = HttpStatus.BAD_REQUEST.value(),
            message = "Erro de validação nos campos informados",
            error = HttpStatus.BAD_REQUEST.reasonPhrase,
            details = details
        )

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error)
    }

    @ExceptionHandler(BadCredentialsException::class)
    fun handleBadCredentials(ex: BadCredentialsException): ResponseEntity<ApiError> {
        val error = ApiError(
            statusCode = HttpStatus.UNAUTHORIZED.value(),
            message = "Credenciais inválidas",
            error = HttpStatus.UNAUTHORIZED.reasonPhrase
        )
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error)
    }

    @ExceptionHandler(AccessDeniedException::class)
    fun handleAccessDenied(ex: AccessDeniedException): ResponseEntity<ApiError> {
        val error = ApiError(
            statusCode = HttpStatus.FORBIDDEN.value(),
            message = "Acesso não autorizado",
            error = HttpStatus.FORBIDDEN.reasonPhrase
        )
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error)
    }

    @ExceptionHandler(Exception::class)
    fun handleGeneralException(ex: Exception): ResponseEntity<ApiError> {
        val error = ApiError(
            statusCode = HttpStatus.INTERNAL_SERVER_ERROR.value(),
            message = ex.message ?: "Ocorreu um erro interno no servidor",
            error = HttpStatus.INTERNAL_SERVER_ERROR.reasonPhrase
        )
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error)
    }
}
