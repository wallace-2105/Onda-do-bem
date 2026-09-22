package com.ondadobem.api.domain.repository

import com.ondadobem.api.domain.entity.PostEntity
import com.ondadobem.api.domain.enums.PostCategory
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface PostRepository : JpaRepository<PostEntity, UUID> {

    @Query(
        """
        SELECT p FROM PostEntity p
        WHERE (:category IS NULL OR p.category = :category)
        AND (:search IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%')))
        ORDER BY p.createdAt DESC
        """
    )
    fun findFeed(
        @Param("category") category: PostCategory?,
        @Param("search") search: String?,
        pageable: Pageable
    ): Page<PostEntity>

    fun findAllByAuthorIdOrderByCreatedAtDesc(authorId: UUID, pageable: Pageable): Page<PostEntity>
}
