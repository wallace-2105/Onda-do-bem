package com.ondadobem.api.domain.entity

import com.ondadobem.api.domain.enums.PostCategory
import jakarta.persistence.*
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "posts")
class PostEntity(
    @Id
    val id: UUID = UUID.randomUUID(),

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "author_id", nullable = false)
    var author: UserEntity,

    @Column(nullable = false)
    var title: String,

    @Column(columnDefinition = "TEXT", nullable = false)
    var description: String,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var category: PostCategory,

    @Column(columnDefinition = "TEXT")
    var imageUrl: String? = null,

    var latitude: Double? = null,

    var longitude: Double? = null,

    var locationName: String? = null,

    var likesCount: Int = 0,

    var commentsCount: Int = 0,

    var impactScore: Int = 10,

    @Column(nullable = false, updatable = false)
    val createdAt: Instant = Instant.now(),

    @Column(nullable = false)
    var updatedAt: Instant = Instant.now()
) {
    @PreUpdate
    fun onUpdate() {
        updatedAt = Instant.now()
    }
}
