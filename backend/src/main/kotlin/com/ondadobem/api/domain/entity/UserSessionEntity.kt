package com.ondadobem.api.domain.entity

import jakarta.persistence.*
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "user_sessions")
class UserSessionEntity(
    @Id
    val id: UUID = UUID.randomUUID(),

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    val user: UserEntity,

    @Column(nullable = false)
    val loginAt: Instant = Instant.now(),

    var logoutAt: Instant? = null,

    @Column(nullable = false)
    var status: String = "ACTIVE", // ACTIVE, LOGGED_OUT, EXPIRED

    var clientInfo: String? = "Mobile Expo Client",

    var ipAddress: String? = null
)
