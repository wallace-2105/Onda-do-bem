package com.ondadobem.api.controller

import com.ondadobem.api.config.UserPrincipal
import com.ondadobem.api.dto.ApiResponse
import com.ondadobem.api.dto.NotificationListResponse
import com.ondadobem.api.service.NotificationService
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/notifications")
class NotificationController(
    private val notificationService: NotificationService
) {

    @GetMapping
    fun list(
        @RequestParam(defaultValue = "50") limit: Int,
        @AuthenticationPrincipal principal: UserPrincipal
    ): ResponseEntity<ApiResponse<NotificationListResponse>> {
        return ResponseEntity.ok(ApiResponse(data = notificationService.listForUser(principal.id, limit)))
    }

    @PatchMapping("/{id}/read")
    fun markAsRead(
        @PathVariable id: UUID,
        @AuthenticationPrincipal principal: UserPrincipal
    ): ResponseEntity<ApiResponse<Unit?>> {
        notificationService.markAsRead(id, principal.id)
        return ResponseEntity.ok(ApiResponse(data = null, message = "Notificação lida"))
    }

    @PatchMapping("/read-all")
    fun markAllAsRead(
        @AuthenticationPrincipal principal: UserPrincipal
    ): ResponseEntity<ApiResponse<Unit?>> {
        notificationService.markAllAsRead(principal.id)
        return ResponseEntity.ok(ApiResponse(data = null, message = "Todas as notificações foram lidas"))
    }
}
