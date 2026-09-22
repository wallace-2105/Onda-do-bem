package com.ondadobem.api.domain.entity

import jakarta.persistence.*
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "users")
class UserEntity(
    @Id
    val id: UUID = UUID.randomUUID(),

    @Column(nullable = false, unique = true)
    var email: String,

    @Column(nullable = false, unique = true)
    var username: String,

    @Column(nullable = false)
    var displayName: String,

    @Column(nullable = false)
    var passwordHash: String,

    @Column(columnDefinition = "TEXT")
    var avatarUrl: String? = null,

    @Column(columnDefinition = "TEXT")
    var bio: String? = null,

    var location: String? = null,

    var totalActions: Int = 0,

    var totalImpact: Int = 0,

    var userRank: Int? = 1,

    var rankTitle: String? = "Protetor da Natureza",

    @Column(nullable = false, updatable = false)
    val createdAt: Instant = Instant.now(),

    @Column(nullable = false)
    var updatedAt: Instant = Instant.now()
) {
    @PreUpdate
    fun onUpdate() {
        updatedAt = Instant.now()
    }
}
