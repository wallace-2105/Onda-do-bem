package com.ondadobem.api.config

import io.jsonwebtoken.Claims
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import org.springframework.stereotype.Service
import java.nio.charset.StandardCharsets
import java.util.*
import javax.crypto.SecretKey

@Service
class JwtService(private val jwtProperties: JwtProperties) {

    private val signingKey: SecretKey
        get() = Keys.hmacShaKeyFor(jwtProperties.secret.toByteArray(StandardCharsets.UTF_8))

    fun generateAccessToken(userId: UUID, email: String): String {
        return buildToken(userId, email, jwtProperties.accessTokenExpirationMs)
    }

    fun generateRefreshToken(userId: UUID, email: String): String {
        return buildToken(userId, email, jwtProperties.refreshTokenExpirationMs)
    }

    private fun buildToken(userId: UUID, email: String, expirationMs: Long): String {
        val now = Date()
        val expiryDate = Date(now.time + expirationMs)

        return Jwts.builder()
            .subject(email)
            .claim("userId", userId.toString())
            .issuedAt(now)
            .expiration(expiryDate)
            .signWith(signingKey)
            .compact()
    }

    fun extractEmail(token: String): String? {
        return extractClaims(token)?.subject
    }

    fun extractUserId(token: String): UUID? {
        val idStr = extractClaims(token)?.get("userId", String::class.java) ?: return null
        return try {
            UUID.fromString(idStr)
        } catch (_: Exception) {
            null
        }
    }

    fun isTokenValid(token: String): Boolean {
        val claims = extractClaims(token) ?: return false
        val expiration = claims.expiration ?: return false
        return expiration.after(Date())
    }

    private fun extractClaims(token: String): Claims? {
        return try {
            Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .payload
        } catch (_: Exception) {
            null
        }
    }
}
