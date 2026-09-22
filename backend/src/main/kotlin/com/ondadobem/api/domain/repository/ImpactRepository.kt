package com.ondadobem.api.domain.repository

import com.ondadobem.api.domain.entity.ImpactEntity
import com.ondadobem.api.domain.enums.ImpactType
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface ImpactRepository : JpaRepository<ImpactEntity, UUID> {
    fun findAllByUserId(userId: UUID): List<ImpactEntity>

    @Query("SELECT i.type, SUM(i.value), i.unit FROM ImpactEntity i GROUP BY i.type, i.unit")
    fun getAggregatedImpact(): List<Array<Any>>

    @Query("SELECT i.type, SUM(i.value), i.unit FROM ImpactEntity i WHERE i.user.id = :userId GROUP BY i.type, i.unit")
    fun getAggregatedImpactByUser(@Param("userId") userId: UUID): List<Array<Any>>
}
