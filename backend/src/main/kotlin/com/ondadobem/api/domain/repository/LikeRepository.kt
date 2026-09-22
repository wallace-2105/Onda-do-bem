package com.ondadobem.api.domain.repository

import com.ondadobem.api.domain.entity.LikeEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.Optional
import java.util.UUID

@Repository
interface LikeRepository : JpaRepository<LikeEntity, UUID> {
    fun findByUserIdAndPostId(userId: UUID, postId: UUID): Optional<LikeEntity>
    fun existsByUserIdAndPostId(userId: UUID, postId: UUID): Boolean
    fun deleteByUserIdAndPostId(userId: UUID, postId: UUID)
    fun countByPostId(postId: UUID): Long
}
