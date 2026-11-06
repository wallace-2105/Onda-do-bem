package com.ondadobem.api.domain.entity

import com.ondadobem.api.domain.enums.NotificationType
import jakarta.persistence.*
import java.time.Instant
import java.util.UUID

@Entity
@Table(
    name = "notifications",
    indexes = [
        Index(name = "idx_notifications_recipient_created", columnList = "recipient_id, created_at")
    ]
)
class NotificationEntity(
    @Id
    val id: UUID = UUID.randomUUID(),

    /** Quem recebe a notificação (autor do post curtido/comentado) */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recipient_id", nullable = false)
    val recipient: UserEntity,

    /** Quem gerou a notificação (null para notificações do sistema) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id")
    val sender: UserEntity? = null,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    val type: NotificationType,

    @Column(nullable = false)
    val title: String,

    @Column(columnDefinition = "TEXT", nullable = false)
    val body: String,

    /** Id do post relacionado */
    val referenceId: UUID? = null,

    @Column(length = 32)
    val referenceType: String? = null,

    @Column(nullable = false)
    var isRead: Boolean = false,

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: Instant = Instant.now()
)
