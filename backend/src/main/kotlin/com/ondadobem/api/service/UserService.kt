package com.ondadobem.api.service

import com.ondadobem.api.domain.repository.UserRepository
import com.ondadobem.api.dto.UpdateUserRequest
import com.ondadobem.api.dto.UserResponse
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.util.UUID

@Service
class UserService(
    private val userRepository: UserRepository
) {

    @Transactional(readOnly = true)
    fun getUserProfile(userId: UUID): UserResponse {
        val user = userRepository.findById(userId)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado") }
        return UserResponse.fromEntity(user)
    }

    @Transactional
    fun updateProfile(userId: UUID, request: UpdateUserRequest): UserResponse {
        val user = userRepository.findById(userId)
            .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado") }

        request.displayName?.let { user.displayName = it.trim() }
        request.bio?.let { user.bio = it.trim() }
        request.location?.let { user.location = it.trim() }
        request.avatarUrl?.let { user.avatarUrl = it }

        val updatedUser = userRepository.save(user)
        return UserResponse.fromEntity(updatedUser)
    }
}
