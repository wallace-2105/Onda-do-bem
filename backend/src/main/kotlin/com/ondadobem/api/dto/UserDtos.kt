package com.ondadobem.api.dto

import com.ondadobem.api.domain.entity.UserEntity
import jakarta.validation.constraints.Size

data class UserResponse(
    val id: String,
    val email: String,
    val username: String,
    val displayName: String,
    val avatarUrl: String?,
    val bio: String?,
    val location: String?,
    val totalActions: Int,
    val totalImpact: Int,
    val rank: Int?,
    val rankTitle: String?,
    val createdAt: String,
    val updatedAt: String
) {
    companion object {
        fun fromEntity(entity: UserEntity): UserResponse {
            return UserResponse(
                id = entity.id.toString(),
                email = entity.email,
                username = entity.username,
                displayName = entity.displayName,
                avatarUrl = entity.avatarUrl,
                bio = entity.bio,
                location = entity.location,
                totalActions = entity.totalActions,
                totalImpact = entity.totalImpact,
                rank = entity.userRank,
                rankTitle = entity.rankTitle,
                createdAt = entity.createdAt.toString(),
                updatedAt = entity.updatedAt.toString()
            )
        }
    }
}

data class UpdateUserRequest(
    @field:Size(min = 2, max = 100, message = "O nome de exibição deve ter entre 2 e 100 caracteres")
    val displayName: String? = null,

    @field:Size(max = 500, message = "A biografia pode ter no máximo 500 caracteres")
    val bio: String? = null,

    val location: String? = null,
    val avatarUrl: String? = null
)
