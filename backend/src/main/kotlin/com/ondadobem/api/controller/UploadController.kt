package com.ondadobem.api.controller

import com.ondadobem.api.config.UserPrincipal
import com.ondadobem.api.dto.ApiResponse
import com.ondadobem.api.dto.UploadImageResponse
import com.ondadobem.api.service.StorageService
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile

@RestController
@RequestMapping("/api/upload")
class UploadController(
    private val storageService: StorageService
) {

    @PostMapping("/image", consumes = [MediaType.MULTIPART_FORM_DATA_VALUE])
    fun uploadImage(
        @RequestParam("file") file: MultipartFile,
        @AuthenticationPrincipal principal: UserPrincipal
    ): ResponseEntity<ApiResponse<UploadImageResponse>> {
        val url = storageService.uploadPostImage(file, principal.id)
        return ResponseEntity.status(HttpStatus.CREATED).body(
            ApiResponse(data = UploadImageResponse(url = url), message = "Imagem enviada com sucesso!")
        )
    }
}
