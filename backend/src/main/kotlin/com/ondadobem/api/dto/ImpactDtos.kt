package com.ondadobem.api.dto

import com.ondadobem.api.domain.enums.ImpactType

data class ImpactMetricItem(
    val type: ImpactType,
    val totalValue: Double,
    val unit: String
)

data class ImpactSummaryResponse(
    val totalActions: Long,
    val totalImpactScore: Long,
    val metrics: List<ImpactMetricItem>
)
