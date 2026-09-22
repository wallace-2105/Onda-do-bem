package com.ondadobem.api.domain.entity

import com.ondadobem.api.domain.enums.ImpactType
import jakarta.persistence.*
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "impacts")
class ImpactEntity(
    @Id
    val id: UUID = UUID.randomUUID(),

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    val user: UserEntity,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id")
    val post: PostEntity? = null,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    val type: ImpactType,

    @Column(name = "impact_value", nullable = false)
    val value: Double,

    @Column(nullable = false)
    val unit: String,

    @Column(columnDefinition = "TEXT")
    val description: String? = null,

    @Column(nullable = false, updatable = false)
    val createdAt: Instant = Instant.now()
)
