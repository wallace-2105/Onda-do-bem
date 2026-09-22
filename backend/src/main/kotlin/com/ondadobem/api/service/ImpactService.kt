package com.ondadobem.api.service

import com.ondadobem.api.domain.enums.ImpactType
import com.ondadobem.api.domain.repository.ImpactRepository
import com.ondadobem.api.domain.repository.PostRepository
import com.ondadobem.api.dto.ImpactMetricItem
import com.ondadobem.api.dto.ImpactSummaryResponse
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class ImpactService(
    private val impactRepository: ImpactRepository,
    private val postRepository: PostRepository
) {

    @Transactional(readOnly = true)
    fun getCommunitySummary(): ImpactSummaryResponse {
        val totalActions = postRepository.count()
        val rawAggregated = impactRepository.getAggregatedImpact()

        val metrics = rawAggregated.mapNotNull { row ->
            val type = row[0] as? ImpactType
            val sum = (row[1] as? Number)?.toDouble() ?: 0.0
            val unit = row[2] as? String ?: ""
            if (type != null) ImpactMetricItem(type, sum, unit) else null
        }

        // Calcula score global estimado
        val totalImpactScore = totalActions * 15

        return ImpactSummaryResponse(
            totalActions = totalActions,
            totalImpactScore = totalImpactScore,
            metrics = metrics
        )
    }

    @Transactional(readOnly = true)
    fun getUserSummary(userId: UUID): ImpactSummaryResponse {
        val impacts = impactRepository.findAllByUserId(userId)
        val metrics = impacts.groupBy { it.type }.map { (type, list) ->
            val total = list.sumOf { it.value }
            val unit = list.firstOrNull()?.unit ?: ""
            ImpactMetricItem(type, total, unit)
        }

        val totalActions = impacts.size.toLong()
        val totalImpactScore = totalActions * 15

        return ImpactSummaryResponse(
            totalActions = totalActions,
            totalImpactScore = totalImpactScore,
            metrics = metrics
        )
    }
}
