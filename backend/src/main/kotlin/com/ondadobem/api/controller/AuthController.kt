package com.ondadobem.api.controller

import com.ondadobem.api.config.UserPrincipal
import com.ondadobem.api.dto.*
import com.ondadobem.api.service.AuthService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/auth")
class AuthController(
    private val authService: AuthService
) {

    @PostMapping("/register")
    fun register(@Valid @RequestBody request: RegisterRequest): ResponseEntity<ApiResponse<AuthResponse>> {
        val result = authService.register(request)
        return ResponseEntity.status(HttpStatus.CREATED).body(
            ApiResponse(data = result, message = "Usuário cadastrado com sucesso")
        )
    }

    @PostMapping("/login")
    fun login(@Valid @RequestBody request: LoginRequest): ResponseEntity<ApiResponse<AuthResponse>> {
        val result = authService.login(request)
        return ResponseEntity.ok(
            ApiResponse(data = result, message = "Login realizado com sucesso")
        )
    }

    @PostMapping("/refresh")
    fun refreshToken(@Valid @RequestBody request: RefreshTokenRequest): ResponseEntity<ApiResponse<AuthResponse>> {
        val result = authService.refreshToken(request)
        return ResponseEntity.ok(
            ApiResponse(data = result, message = "Token renovado com sucesso")
        )
    }

    @GetMapping("/me")
    fun getMe(@AuthenticationPrincipal principal: UserPrincipal): ResponseEntity<ApiResponse<UserResponse>> {
        val user = authService.getMe(principal.id)
        return ResponseEntity.ok(ApiResponse(data = user))
    }

    @PostMapping("/logout")
    fun logout(): ResponseEntity<ApiResponse<Map<String, String>>> {
        return ResponseEntity.ok(
            ApiResponse(data = mapOf("status" to "logged_out"), message = "Logout efetuado com sucesso")
        )
    }
}
