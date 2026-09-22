package com.ondadobem.api.dto

import com.ondadobem.api.domain.entity.CommentEntity
import com.ondadobem.api.domain.entity.PostEntity
import com.ondadobem.api.domain.enums.ImpactType
import com.ondadobem.api.domain.enums.PostCategory
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size

data class PostResponse(
    val id: String,
    val authorId: String,
    val author: UserResponse,
    val title: String,
    val description: String,
    val category: PostCategory,
    val imageUrl: String?,
    val latitude: Double?,
    val longitude: Double?,
    val locationName: String?,
    val likesCount: Int,
    val commentsCount: Int,
    val impactScore: Int,
    val isLiked: Boolean,
    val comments: List<CommentResponse>? = null,
    val createdAt: String,
    val updatedAt: String
) {
    companion object {
        fun fromEntity(entity: PostEntity, isLiked: Boolean = false, comments: List<CommentResponse>? = null): PostResponse {
            return PostResponse(
                id = entity.id.toString(),
                authorId = entity.author.id.toString(),
                author = UserResponse.fromEntity(entity.author),
                title = entity.title,
                description = entity.description,
                category = entity.category,
                imageUrl = entity.imageUrl,
                latitude = entity.latitude,
                longitude = entity.longitude,
                locationName = entity.locationName,
                likesCount = entity.likesCount,
                commentsCount = entity.commentsCount,
                impactScore = entity.impactScore,
                isLiked = isLiked,
                comments = comments,
                createdAt = entity.createdAt.toString(),
                updatedAt = entity.updatedAt.toString()
            )
        }
    }
}

data class CreatePostRequest(
    @field:NotBlank(message = "O título da ação é obrigatório")
    @field:Size(min = 3, max = 120, message = "O título deve ter entre 3 e 120 caracteres")
    val title: String,

    @field:NotBlank(message = "A descrição é obrigatória")
    @field:Size(min = 5, max = 2000, message = "A descrição deve ter entre 5 e 2000 caracteres")
    val description: String,

    @field:NotNull(message = "A categoria é obrigatória")
    val category: PostCategory,

    val imageUrl: String? = null,
    val latitude: Double? = null,
    val longitude: Double? = null,
    val locationName: String? = null,

    // Métricas de impacto opcionais associadas ao post
    val impactType: ImpactType? = null,
    val impactValue: Double? = null,
    val impactUnit: String? = null
)

data class CommentResponse(
    val id: String,
    val authorId: String,
    val author: UserResponse,
    val postId: String,
    val parentId: String?,
    val content: String,
    val createdAt: String,
    val updatedAt: String
) {
    companion object {
        fun fromEntity(entity: CommentEntity): CommentResponse {
            return CommentResponse(
                id = entity.id.toString(),
                authorId = entity.author.id.toString(),
                author = UserResponse.fromEntity(entity.author),
                postId = entity.post.id.toString(),
                parentId = entity.parentId?.toString(),
                content = entity.content,
                createdAt = entity.createdAt.toString(),
                updatedAt = entity.updatedAt.toString()
            )
        }
    }
}

data class CreateCommentRequest(
    @field:NotBlank(message = "O conteúdo do comentário não pode ser vazio")
    @field:Size(max = 1000, message = "O comentário pode ter no máximo 1000 caracteres")
    val content: String,

    val parentId: String? = null
)

data class LikeResponse(
    val isLiked: Boolean,
    val likesCount: Int
)
