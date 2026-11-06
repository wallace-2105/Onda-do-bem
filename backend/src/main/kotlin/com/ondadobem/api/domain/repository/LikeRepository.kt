package com.ondadobem.api.domain.repository

import com.ondadobem.api.domain.entity.LikeEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.util.Optional
import java.util.UUID

@Repository
interface LikeRepository : JpaRepository<LikeEntity, UUID> {
    fun findByUserIdAndPostId(userId: UUID, postId: UUID): Optional<LikeEntity>
    fun existsByUserIdAndPostId(userId: UUID, postId: UUID): Boolean
    fun deleteByUserIdAndPostId(userId: UUID, postId: UUID)
    fun countByPostId(postId: UUID): Long

    /** Curtidas de outros usuários no post (as que renderam pontos ao autor) */
    @Query("SELECT COUNT(l) FROM LikeEntity l WHERE l.post.id = :postId AND l.user.id <> :authorId")
    fun countReceivedLikes(@Param("postId") postId: UUID, @Param("authorId") authorId: UUID): Long

    @Modifying
    @Query("DELETE FROM LikeEntity l WHERE l.post.id = :postId")
    fun deleteAllByPostId(@Param("postId") postId: UUID): Int
}
