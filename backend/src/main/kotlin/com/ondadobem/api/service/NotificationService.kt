package com.ondadobem.api.service

import com.ondadobem.api.domain.entity.NotificationEntity
import com.ondadobem.api.domain.entity.PostEntity
import com.ondadobem.api.domain.entity.UserEntity
import com.ondadobem.api.domain.enums.NotificationType
import com.ondadobem.api.domain.repository.NotificationRepository
import com.ondadobem.api.dto.NotificationListResponse
import com.ondadobem.api.dto.NotificationResponse
import org.springframework.data.domain.PageRequest
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.util.UUID

@Service
class NotificationService(
    private val notificationRepository: NotificationRepository
) {

    @Transactional(readOnly = true)
    fun listForUser(userId: UUID, limit: Int): NotificationListResponse {
        val pageSize = if (limit in 1..100) limit else 50
        val notifications = notificationRepository
            .findLatestForRecipient(userId, PageRequest.of(0, pageSize))
            .map { NotificationResponse.fromEntity(it) }

        return NotificationListResponse(
            notifications = notifications,
            unreadCount = notificationRepository.countByRecipientIdAndIsReadFalse(userId)
        )
    }

    @Transactional
    fun markAsRead(notificationId: UUID, userId: UUID) {
        val notification = notificationRepository.findByIdAndRecipientId(notificationId, userId)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Notificação não encontrada")
        notification.isRead = true
        notificationRepository.save(notification)
    }

    @Transactional
    fun markAllAsRead(userId: UUID) {
        notificationRepository.markAllAsRead(userId)
    }

    /** Curtida: avisa o autor do post (nunca a si mesmo) */
    @Transactional
    fun notifyLike(sender: UserEntity, post: PostEntity) {
        if (post.author.id == sender.id) return
        // Curtir → descurtir → curtir não gera notificações repetidas
        notificationRepository.deleteBySenderAndReference(sender.id, post.id, NotificationType.LIKE)
        notificationRepository.save(
            NotificationEntity(
                recipient = post.author,
                sender = sender,
                type = NotificationType.LIKE,
                title = "Nova curtida",
                body = "${sender.displayName} curtiu sua ação \"${post.title}\"",
                referenceId = post.id,
                referenceType = "POST"
            )
        )
    }

    /** Curtida desfeita: remove a notificação correspondente */
    @Transactional
    fun removeLike(sender: UserEntity, post: PostEntity) {
        notificationRepository.deleteBySenderAndReference(sender.id, post.id, NotificationType.LIKE)
    }

    /** Comentário: avisa o autor do post (nunca a si mesmo) */
    @Transactional
    fun notifyComment(sender: UserEntity, post: PostEntity, content: String) {
        if (post.author.id == sender.id) return
        val preview = if (content.length > 80) content.take(80).trimEnd() + "…" else content
        notificationRepository.save(
            NotificationEntity(
                recipient = post.author,
                sender = sender,
                type = NotificationType.COMMENT,
                title = "Novo comentário",
                body = "${sender.displayName} comentou em \"${post.title}\": \"$preview\"",
                referenceId = post.id,
                referenceType = "POST"
            )
        )
    }
}
