package com.ondadobem.api.service

import com.ondadobem.api.config.JwtService
import com.ondadobem.api.domain.entity.UserEntity
import com.ondadobem.api.domain.entity.UserSessionEntity
import com.ondadobem.api.domain.repository.UserRepository
import com.ondadobem.api.domain.repository.UserSessionRepository
import com.ondadobem.api.dto.*
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.time.Instant
import java.util.UUID

@Service
class AuthService(
    private val userRepository: UserRepository,
    private val userSessionRepository: UserSessionRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtService: JwtService
) {
    private val logger = LoggerFactory.getLogger(AuthService::class.java)

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
            passwordHash = passwordEncoder.encode(request.password)!!,
            lastLoginAt = Instant.now(),
            loginCount = 1
        )

        val savedUser = userRepository.save(newUser)

        // Salva a sessão no banco de dados
        userSessionRepository.save(
            UserSessionEntity(
                user = savedUser,
                loginAt = Instant.now(),
                status = "ACTIVE",
                clientInfo = "Mobile Expo App"
            )
        )

        logger.info("Novo usuário registrado e sessão salva no banco de dados: ${savedUser.email} (ID: ${savedUser.id})")

        val accessToken = jwtService.generateAccessToken(savedUser.id, savedUser.email)
        val refreshToken = jwtService.generateRefreshToken(savedUser.id, savedUser.email)

        return AuthResponse(
            accessToken = accessToken,
            refreshToken = refreshToken,
            user = UserResponse.fromEntity(savedUser)
        )
    }

    @Transactional
    fun login(request: LoginRequest): AuthResponse {
        val normalizedEmail = request.email.trim().lowercase()

        val user = userRepository.findByEmail(normalizedEmail)
            .orElseThrow { ResponseStatusException(HttpStatus.UNAUTHORIZED, "E-mail ou senha incorretos") }

        if (!passwordEncoder.matches(request.password, user.passwordHash)) {
            throw ResponseStatusException(HttpStatus.UNAUTHORIZED, "E-mail ou senha incorretos")
        }

        // 💾 Persiste o login no banco de dados: atualiza data/hora e contador
        user.lastLoginAt = Instant.now()
        user.loginCount += 1
        val updatedUser = userRepository.save(user)

        // 💾 Salva o registro da nova sessão no banco de dados
        userSessionRepository.save(
            UserSessionEntity(
                user = updatedUser,
                loginAt = Instant.now(),
                status = "ACTIVE",
                clientInfo = "Mobile Expo App"
            )
        )

        logger.info("Login realizado e salvo no banco de dados com sucesso para: ${updatedUser.email} (Total de logins: ${updatedUser.loginCount})")

        val accessToken = jwtService.generateAccessToken(updatedUser.id, updatedUser.email)
        val refreshToken = jwtService.generateRefreshToken(updatedUser.id, updatedUser.email)

        return AuthResponse(
            accessToken = accessToken,
            refreshToken = refreshToken,
            user = UserResponse.fromEntity(updatedUser)
        )
    }

    @Transactional
    fun logout(userId: UUID?) {
        if (userId != null) {
            val sessions = userSessionRepository.findByUserIdOrderByLoginAtDesc(userId)
            val activeSession = sessions.firstOrNull { it.status == "ACTIVE" }
            if (activeSession != null) {
                activeSession.status = "LOGGED_OUT"
                activeSession.logoutAt = Instant.now()
                userSessionRepository.save(activeSession)
                logger.info("Sessão finalizada no banco de dados para o usuário $userId")
            }
        }
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
