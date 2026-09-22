package com.ondadobem.api.dto

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class LoginRequest(
    @field:NotBlank(message = "O e-mail é obrigatório")
    @field:Email(message = "Formato de e-mail inválido")
    val email: String,

    @field:NotBlank(message = "A senha é obrigatória")
    val password: String
)

data class RegisterRequest(
    @field:NotBlank(message = "O e-mail é obrigatório")
    @field:Email(message = "Formato de e-mail inválido")
    val email: String,

    @field:NotBlank(message = "O nome de usuário é obrigatório")
    @field:Size(min = 3, max = 30, message = "O nome de usuário deve ter entre 3 e 30 caracteres")
    val username: String,

    @field:NotBlank(message = "O nome de exibição é obrigatório")
    @field:Size(min = 2, max = 100, message = "O nome de exibição deve ter entre 2 e 100 caracteres")
    val displayName: String,

    @field:NotBlank(message = "A senha é obrigatória")
    @field:Size(min = 6, message = "A senha deve ter no mínimo 6 caracteres")
    val password: String
)

data class AuthResponse(
    val accessToken: String,
    val refreshToken: String,
    val user: UserResponse
)

data class RefreshTokenRequest(
    @field:NotBlank(message = "O refresh token é obrigatório")
    val refreshToken: String
)
