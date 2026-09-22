package com.ondadobem.api.controller

import com.ondadobem.api.config.UserPrincipal
import com.ondadobem.api.dto.ApiResponse
import com.ondadobem.api.dto.UpdateUserRequest
import com.ondadobem.api.dto.UserResponse
import com.ondadobem.api.service.UserService
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/users")
class UserController(
    private val userService: UserService
) {

    @GetMapping("/{id}")
    fun getUserById(@PathVariable id: UUID): ResponseEntity<ApiResponse<UserResponse>> {
        val user = userService.getUserProfile(id)
        return ResponseEntity.ok(ApiResponse(data = user))
    }

    @GetMapping("/me")
    fun getCurrentUser(@AuthenticationPrincipal principal: UserPrincipal): ResponseEntity<ApiResponse<UserResponse>> {
        val user = userService.getUserProfile(principal.id)
        return ResponseEntity.ok(ApiResponse(data = user))
    }

    @PutMapping("/me")
    fun updateProfile(
        @AuthenticationPrincipal principal: UserPrincipal,
        @Valid @RequestBody request: UpdateUserRequest
    ): ResponseEntity<ApiResponse<UserResponse>> {
        val updatedUser = userService.updateProfile(principal.id, request)
        return ResponseEntity.ok(
            ApiResponse(data = updatedUser, message = "Perfil atualizado com sucesso!")
        )
    }
}
