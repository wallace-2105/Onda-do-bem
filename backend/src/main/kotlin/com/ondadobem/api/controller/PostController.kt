package com.ondadobem.api.controller

import com.ondadobem.api.config.UserPrincipal
import com.ondadobem.api.domain.enums.PostCategory
import com.ondadobem.api.dto.*
import com.ondadobem.api.service.PostService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/posts")
class PostController(
    private val postService: PostService
) {

    @GetMapping
    fun getFeed(
        @RequestParam(required = false) category: PostCategory?,
        @RequestParam(required = false) search: String?,
        @RequestParam(defaultValue = "1") page: Int,
        @RequestParam(defaultValue = "20") limit: Int,
        @AuthenticationPrincipal principal: UserPrincipal?
    ): ResponseEntity<PaginatedResponse<PostResponse>> {
        val result = postService.getFeed(category, search, page, limit, principal?.id)
        return ResponseEntity.ok(result)
    }

    @GetMapping("/{id}")
    fun getPostById(
        @PathVariable id: UUID,
        @AuthenticationPrincipal principal: UserPrincipal?
    ): ResponseEntity<ApiResponse<PostResponse>> {
        val post = postService.getPostById(id, principal?.id)
        return ResponseEntity.ok(ApiResponse(data = post))
    }

    @PostMapping
    fun createPost(
        @Valid @RequestBody request: CreatePostRequest,
        @AuthenticationPrincipal principal: UserPrincipal
    ): ResponseEntity<ApiResponse<PostResponse>> {
        val post = postService.createPost(request, principal.id)
        return ResponseEntity.status(HttpStatus.CREATED).body(
            ApiResponse(data = post, message = "Publicação criada com sucesso!")
        )
    }

    @PostMapping("/{id}/like")
    fun toggleLike(
        @PathVariable id: UUID,
        @AuthenticationPrincipal principal: UserPrincipal
    ): ResponseEntity<ApiResponse<LikeResponse>> {
        val result = postService.toggleLike(id, principal.id)
        val message = if (result.isLiked) "Publicação curtida!" else "Curtida removida!"
        return ResponseEntity.ok(ApiResponse(data = result, message = message))
    }

    @DeleteMapping("/{id}/like")
    fun unlike(
        @PathVariable id: UUID,
        @AuthenticationPrincipal principal: UserPrincipal
    ): ResponseEntity<ApiResponse<LikeResponse>> {
        val result = postService.toggleLike(id, principal.id)
        return ResponseEntity.ok(ApiResponse(data = result, message = "Curtida removida!"))
    }

    @GetMapping("/{id}/comments")
    fun getComments(@PathVariable id: UUID): ResponseEntity<ApiResponse<List<CommentResponse>>> {
        val comments = postService.getComments(id)
        return ResponseEntity.ok(ApiResponse(data = comments))
    }

    @PostMapping("/{id}/comments")
    fun addComment(
        @PathVariable id: UUID,
        @Valid @RequestBody request: CreateCommentRequest,
        @AuthenticationPrincipal principal: UserPrincipal
    ): ResponseEntity<ApiResponse<CommentResponse>> {
        val comment = postService.addComment(id, request, principal.id)
        return ResponseEntity.status(HttpStatus.CREATED).body(
            ApiResponse(data = comment, message = "Comentário adicionado com sucesso!")
        )
    }
}
