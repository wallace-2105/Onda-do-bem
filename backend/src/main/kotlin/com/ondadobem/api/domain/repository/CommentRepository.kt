package com.ondadobem.api.domain.repository

import com.ondadobem.api.domain.entity.CommentEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface CommentRepository : JpaRepository<CommentEntity, UUID> {
    fun findAllByPostIdOrderByCreatedAtAsc(postId: UUID): List<CommentEntity>
    fun countByPostId(postId: UUID): Long

    @Modifying
    @Query("DELETE FROM CommentEntity c WHERE c.post.id = :postId")
    fun deleteAllByPostId(@Param("postId") postId: UUID): Int
}
