package com.ondadobem.api.service

import com.ondadobem.api.config.JwtService
import com.ondadobem.api.domain.entity.UserEntity
import com.ondadobem.api.domain.repository.UserRepository
import com.ondadobem.api.dto.*
import org.springframework.http.HttpStatus
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.util.UUID

@Service
class AuthService(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtService: JwtService
) {

    @Transactional
    fun register(request: RegisterRequest): AuthResponse {
        val normalizedEmail = request.email.trim().lowercase()
        val normalizedUsername = request.username.trim().lowercase()

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw ResponseStatusException(HttpStatus.CONFLICT, "Este e-mail já está cadastrado")
        }

        if (userRepository.existsByUsername(normalizedUsername)) {
            throw ResponseStatusException(HttpStatus.CONFLICT, "Este nome de usuário já está em uso")
        }

        val newUser = UserEntity(
            email = normalizedEmail,
            username = normalizedUsername,
            displayName = request.displayName.trim(),
            passwordHash = passwordEncoder.encode(request.password)!!
        )

        val savedUser = userRepository.save(newUser)

        val accessToken = jwtService.generateAccessToken(savedUser.id, savedUser.email)
        val refreshToken = jwtService.generateRefreshToken(savedUser.id, savedUser.email)

        return AuthResponse(
            accessToken = accessToken,
            refreshToken = refreshToken,
            user = UserResponse.fromEntity(savedUser)
        )
    }

    @Transactional(readOnly = true)
    fun login(request: LoginRequest): AuthResponse {
        val normalizedEmail = request.email.trim().lowercase()

        val user = userRepository.findByEmail(normalizedEmail)
            .orElseThrow { ResponseStatusException(HttpStatus.UNAUTHORIZED, "E-mail ou senha incorretos") }

        if (!passwordEncoder.matches(request.password, user.passwordHash)) {
            throw ResponseStatusException(HttpStatus.UNAUTHORIZED, "E-mail ou senha incorretos")
        }

        val accessToken = jwtService.generateAccessToken(user.id, user.email)
        val refreshToken = jwtService.generateRefreshToken(user.id, user.email)

        return AuthResponse(
            accessToken = accessToken,
            refreshToken = refreshToken,
            user = UserResponse.fromEntity(user)
        )
    }

    @Transactional(readOnly = true)
    fun refreshToken(request: RefreshTokenRequest): AuthResponse {
        if (!jwtService.isTokenValid(request.refreshToken)) {
            throw ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token inválido ou expirado")
        }

        val userId = jwtService.extractUserId(request.refreshToken)
            ?: throw ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token inválido")

        val user = userRepository.findById(userId)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado") }

        val newAccessToken = jwtService.generateAccessToken(user.id, user.email)
        val newRefreshToken = jwtService.generateRefreshToken(user.id, user.email)

        return AuthResponse(
            accessToken = newAccessToken,
            refreshToken = newRefreshToken,
            user = UserResponse.fromEntity(user)
        )
    }

    @Transactional(readOnly = true)
    fun getMe(userId: UUID): UserResponse {
        val user = userRepository.findById(userId)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado") }
        return UserResponse.fromEntity(user)
    }
}
