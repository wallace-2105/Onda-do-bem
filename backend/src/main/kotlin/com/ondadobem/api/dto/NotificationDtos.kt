package com.ondadobem.api.dto

import com.ondadobem.api.domain.entity.NotificationEntity
import com.ondadobem.api.domain.entity.UserEntity

/** Dados públicos de quem gerou a notificação (sem e-mail) */
data class NotificationSenderResponse(
    val id: String,
    val username: String,
    val displayName: String,
    val avatarUrl: String?
) {
    companion object {
        fun fromEntity(entity: UserEntity) = NotificationSenderResponse(
            id = entity.id.toString(),
            username = entity.username,
            displayName = entity.displayName,
            avatarUrl = entity.avatarUrl
        )
    }
}

data class NotificationResponse(
    val id: String,
    val recipientId: String,
    val senderId: String?,
    val sender: NotificationSenderResponse?,
    val type: String,
    val title: String,
    val body: String,
    val referenceId: String?,
    val referenceType: String?,
    val isRead: Boolean,
    val createdAt: String
) {
    companion object {
        fun fromEntity(entity: NotificationEntity) = NotificationResponse(
            id = entity.id.toString(),
            recipientId = entity.recipient.id.toString(),
            senderId = entity.sender?.id?.toString(),
            sender = entity.sender?.let { NotificationSenderResponse.fromEntity(it) },
            type = entity.type.name,
            title = entity.title,
            body = entity.body,
            referenceId = entity.referenceId?.toString(),
            referenceType = entity.referenceType,
            isRead = entity.isRead,
            createdAt = entity.createdAt.toString()
        )
    }
}

data class NotificationListResponse(
    val notifications: List<NotificationResponse>,
    val unreadCount: Long
)
