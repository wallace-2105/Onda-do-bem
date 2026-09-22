package com.ondadobem.api.service

import com.ondadobem.api.domain.entity.CommentEntity
import com.ondadobem.api.domain.entity.ImpactEntity
import com.ondadobem.api.domain.entity.LikeEntity
import com.ondadobem.api.domain.entity.PostEntity
import com.ondadobem.api.domain.enums.PostCategory
import com.ondadobem.api.domain.repository.*
import com.ondadobem.api.dto.*
import org.springframework.data.domain.PageRequest
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.util.UUID

@Service
class PostService(
    private val postRepository: PostRepository,
    private val userRepository: UserRepository,
    private val likeRepository: LikeRepository,
    private val commentRepository: CommentRepository,
    private val impactRepository: ImpactRepository
) {

    @Transactional(readOnly = true)
    fun getFeed(
        category: PostCategory?,
        search: String?,
        page: Int,
        limit: Int,
        currentUserId: UUID?
    ): PaginatedResponse<PostResponse> {
        val pageNumber = if (page > 0) page - 1 else 0
        val pageSize = if (limit in 1..100) limit else 20
        val pageable = PageRequest.of(pageNumber, pageSize)

        val postsPage = postRepository.findFeed(category, search, pageable)

        val postResponses = postsPage.content.map { post ->
            val isLiked = if (currentUserId != null) {
                likeRepository.existsByUserIdAndPostId(currentUserId, post.id)
            } else false

            PostResponse.fromEntity(post, isLiked)
        }

        val meta = PaginationMeta(
            currentPage = postsPage.number + 1,
            totalPages = postsPage.totalPages,
            totalItems = postsPage.totalElements,
            itemsPerPage = postsPage.size,
            hasNextPage = postsPage.hasNext(),
            hasPreviousPage = postsPage.hasPrevious()
        )

        return PaginatedResponse(data = postResponses, meta = meta)
    }

    @Transactional(readOnly = true)
    fun getPostById(postId: UUID, currentUserId: UUID?): PostResponse {
        val post = postRepository.findById(postId)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Publicação não encontrada") }

        val isLiked = if (currentUserId != null) {
            likeRepository.existsByUserIdAndPostId(currentUserId, post.id)
        } else false

        val comments = commentRepository.findAllByPostIdOrderByCreatedAtAsc(postId)
            .map { CommentResponse.fromEntity(it) }

        return PostResponse.fromEntity(post, isLiked, comments)
    }

    @Transactional
    fun createPost(request: CreatePostRequest, currentUserId: UUID): PostResponse {
        val author = userRepository.findById(currentUserId)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado") }

        val calculatedImpactScore = if (request.impactValue != null && request.impactValue > 0) {
            (request.impactValue * 5).toInt().coerceAtLeast(10)
        } else 10

        val post = PostEntity(
            author = author,
            title = request.title.trim(),
            description = request.description.trim(),
            category = request.category,
            imageUrl = request.imageUrl,
            latitude = request.latitude,
            longitude = request.longitude,
            locationName = request.locationName,
            impactScore = calculatedImpactScore
        )

        val savedPost = postRepository.save(post)

        // Se houver métricas de impacto atreladas à ação
        if (request.impactType != null && request.impactValue != null && request.impactUnit != null) {
            val impact = ImpactEntity(
                user = author,
                post = savedPost,
                type = request.impactType,
                value = request.impactValue,
                unit = request.impactUnit,
                description = request.title
            )
            impactRepository.save(impact)
        }

        // Atualiza contadores do usuário
        author.totalActions += 1
        author.totalImpact += calculatedImpactScore
        userRepository.save(author)

        return PostResponse.fromEntity(savedPost, isLiked = false)
    }

    @Transactional
    fun toggleLike(postId: UUID, currentUserId: UUID): LikeResponse {
        val post = postRepository.findById(postId)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Publicação não encontrada") }

        val user = userRepository.findById(currentUserId)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado") }

        val existingLike = likeRepository.findByUserIdAndPostId(currentUserId, postId)

        val isLiked = if (existingLike.isPresent) {
            likeRepository.delete(existingLike.get())
            post.likesCount = (post.likesCount - 1).coerceAtLeast(0)
            false
        } else {
            likeRepository.save(LikeEntity(user = user, post = post))
            post.likesCount += 1
            true
        }

        postRepository.save(post)

        return LikeResponse(
            isLiked = isLiked,
            likesCount = post.likesCount
        )
    }

    @Transactional(readOnly = true)
    fun getComments(postId: UUID): List<CommentResponse> {
        if (!postRepository.existsById(postId)) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "Publicação não encontrada")
        }

        return commentRepository.findAllByPostIdOrderByCreatedAtAsc(postId)
            .map { CommentResponse.fromEntity(it) }
    }

    @Transactional
    fun addComment(postId: UUID, request: CreateCommentRequest, currentUserId: UUID): CommentResponse {
        val post = postRepository.findById(postId)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Publicação não encontrada") }

        val author = userRepository.findById(currentUserId)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado") }

        val parentIdUuid = request.parentId?.let {
            try { UUID.fromString(it) } catch (_: Exception) { null }
        }

        val comment = CommentEntity(
            author = author,
            post = post,
            parentId = parentIdUuid,
            content = request.content.trim()
        )

        val savedComment = commentRepository.save(comment)

        post.commentsCount += 1
        postRepository.save(post)

        return CommentResponse.fromEntity(savedComment)
    }
}
