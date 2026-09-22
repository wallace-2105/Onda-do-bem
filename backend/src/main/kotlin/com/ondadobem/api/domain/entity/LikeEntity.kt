package com.ondadobem.api.domain.entity

import jakarta.persistence.*
import java.time.Instant
import java.util.UUID

@Entity
@Table(
    name = "likes",
    uniqueConstraints = [
        UniqueConstraint(columnNames = ["user_id", "post_id"])
    ]
)
class LikeEntity(
    @Id
    val id: UUID = UUID.randomUUID(),

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    val user: UserEntity,

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "post_id", nullable = false)
    val post: PostEntity,

    @Column(nullable = false, updatable = false)
    val createdAt: Instant = Instant.now()
)
