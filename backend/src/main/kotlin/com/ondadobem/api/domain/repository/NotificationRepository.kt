package com.ondadobem.api.domain.repository

import com.ondadobem.api.domain.entity.NotificationEntity
import com.ondadobem.api.domain.enums.NotificationType
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface NotificationRepository : JpaRepository<NotificationEntity, UUID> {

    @Query(
        """
        SELECT n FROM NotificationEntity n
        LEFT JOIN FETCH n.sender
        WHERE n.recipient.id = :recipientId
        ORDER BY n.createdAt DESC
        """
    )
    fun findLatestForRecipient(@Param("recipientId") recipientId: UUID, pageable: Pageable): List<NotificationEntity>

    fun countByRecipientIdAndIsReadFalse(recipientId: UUID): Long

    fun findByIdAndRecipientId(id: UUID, recipientId: UUID): NotificationEntity?

    @Modifying
    @Query("UPDATE NotificationEntity n SET n.isRead = true WHERE n.recipient.id = :recipientId AND n.isRead = false")
    fun markAllAsRead(@Param("recipientId") recipientId: UUID): Int

    /** Remove todas as notificações ligadas a um post (ao excluir a publicação) */
    @Modifying
    @Query("DELETE FROM NotificationEntity n WHERE n.referenceId = :referenceId")
    fun deleteAllByReferenceId(@Param("referenceId") referenceId: UUID): Int

    /** Remove a notificação de curtida quando ela é desfeita (evita duplicadas ao curtir de novo) */
    @Modifying
    @Query(
        """
        DELETE FROM NotificationEntity n
        WHERE n.sender.id = :senderId AND n.referenceId = :referenceId AND n.type = :type
        """
    )
    fun deleteBySenderAndReference(
        @Param("senderId") senderId: UUID,
        @Param("referenceId") referenceId: UUID,
        @Param("type") type: NotificationType
    ): Int
}
