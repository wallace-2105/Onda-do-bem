package com.ondadobem.api.controller

import com.ondadobem.api.dto.ApiResponse
import com.ondadobem.api.dto.ImpactSummaryResponse
import com.ondadobem.api.service.ImpactService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/impact")
class ImpactController(
    private val impactService: ImpactService
) {

    @GetMapping("/summary")
    fun getSummary(): ResponseEntity<ApiResponse<ImpactSummaryResponse>> {
        val summary = impactService.getCommunitySummary()
        return ResponseEntity.ok(ApiResponse(data = summary))
    }

    @GetMapping("/community")
    fun getCommunity(): ResponseEntity<ApiResponse<ImpactSummaryResponse>> {
        val summary = impactService.getCommunitySummary()
        return ResponseEntity.ok(ApiResponse(data = summary))
    }

    @GetMapping("/user/{id}")
    fun getUserImpact(@PathVariable id: UUID): ResponseEntity<ApiResponse<ImpactSummaryResponse>> {
        val summary = impactService.getUserSummary(id)
        return ResponseEntity.ok(ApiResponse(data = summary))
    }
}
