package com.ondadobem.api.domain.repository

import com.ondadobem.api.domain.entity.UserSessionEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface UserSessionRepository : JpaRepository<UserSessionEntity, UUID> {
    fun findByUserIdOrderByLoginAtDesc(userId: UUID): List<UserSessionEntity>
}
