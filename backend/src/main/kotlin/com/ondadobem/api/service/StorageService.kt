package com.ondadobem.api.service

import com.ondadobem.api.config.SupabaseProperties
import org.slf4j.LoggerFactory
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.context.event.EventListener
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.stereotype.Service
import org.springframework.web.client.RestClient
import org.springframework.web.client.RestClientException
import org.springframework.web.client.RestClientResponseException
import org.springframework.web.multipart.MultipartFile
import org.springframework.web.server.ResponseStatusException
import java.util.UUID

/**
 * Upload de imagens para o Supabase Storage via API REST.
 * Cada arquivo recebe um nome único (UUID), então a URL pública é imutável e pode ser cacheada.
 */
@Service
class StorageService(
    private val supabaseProperties: SupabaseProperties
) {
    private val log = LoggerFactory.getLogger(javaClass)
    private val restClient = RestClient.create()

    private val allowedImageTypes = mapOf(
        "image/jpeg" to "jpg",
        "image/png" to "png",
        "image/webp" to "webp",
        "image/gif" to "gif"
    )

    private val baseUrl get() = supabaseProperties.url.trimEnd('/')
    private val bucket get() = supabaseProperties.storageBucket
    private val isConfigured get() = supabaseProperties.url.isNotBlank() && supabaseProperties.serviceRoleKey.isNotBlank()

    /** Envia a imagem para `<folder>/<ownerId>/<uuid>.<ext>` e retorna a URL pública. */
    fun uploadImage(file: MultipartFile, folder: String, ownerId: UUID): String {
        if (!isConfigured) {
            throw ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Armazenamento de imagens não configurado no servidor")
        }
        if (file.isEmpty) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Arquivo de imagem vazio")
        }

        val contentType = file.contentType?.lowercase()
        val extension = allowedImageTypes[contentType]
            ?: throw ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Formato de imagem não suportado. Use JPG, PNG, WEBP ou GIF.")

        val objectPath = "$folder/$ownerId/${UUID.randomUUID()}.$extension"

        try {
            restClient.post()
                .uri("$baseUrl/storage/v1/object/$bucket/$objectPath")
                .header("Authorization", "Bearer ${supabaseProperties.serviceRoleKey}")
                .header("apikey", supabaseProperties.serviceRoleKey)
                .header("cache-control", "31536000")
                .header("x-upsert", "false")
                .contentType(MediaType.parseMediaType(contentType!!))
                .body(file.bytes)
                .retrieve()
                .toBodilessEntity()
        } catch (ex: RestClientResponseException) {
            log.error("[Storage] Falha no upload para o Supabase ({}): {}", ex.statusCode, ex.responseBodyAsString)
            throw ResponseStatusException(HttpStatus.BAD_GATEWAY, "Falha ao enviar imagem para o armazenamento")
        } catch (ex: RestClientException) {
            log.error("[Storage] Supabase Storage inacessível: {}", ex.message)
            throw ResponseStatusException(HttpStatus.BAD_GATEWAY, "Falha ao enviar imagem para o armazenamento")
        }

        return "$baseUrl/storage/v1/object/public/$bucket/$objectPath"
    }

    /**
     * Remove do Storage uma imagem enviada pelo app (melhor esforço: falhas só geram log).
     * URLs externas (Unsplash, assets do app) são ignoradas.
     */
    fun deleteByPublicUrl(publicUrl: String?) {
        if (publicUrl.isNullOrBlank() || !isConfigured) return
        val prefix = "$baseUrl/storage/v1/object/public/$bucket/"
        if (!publicUrl.startsWith(prefix)) return
        val objectPath = publicUrl.removePrefix(prefix)

        try {
            restClient.delete()
                .uri("$baseUrl/storage/v1/object/$bucket/$objectPath")
                .header("Authorization", "Bearer ${supabaseProperties.serviceRoleKey}")
                .header("apikey", supabaseProperties.serviceRoleKey)
                .retrieve()
                .toBodilessEntity()
        } catch (ex: RestClientException) {
            log.warn("[Storage] Não foi possível remover {}: {}", objectPath, ex.message)
        }
    }

    /** Cria o bucket público na inicialização, caso ainda não exista. */
    @EventListener(ApplicationReadyEvent::class)
    fun ensureBucketExists() {
        if (!isConfigured) {
            log.warn("[Storage] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY não definidos — upload de imagens desativado")
            return
        }

        try {
            restClient.post()
                .uri("$baseUrl/storage/v1/bucket")
                .header("Authorization", "Bearer ${supabaseProperties.serviceRoleKey}")
                .header("apikey", supabaseProperties.serviceRoleKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(
                    mapOf(
                        "id" to bucket,
                        "name" to bucket,
                        "public" to true,
                        "allowed_mime_types" to allowedImageTypes.keys.toList()
                    )
                )
                .retrieve()
                .toBodilessEntity()
            log.info("[Storage] Bucket público '{}' criado no Supabase", bucket)
        } catch (ex: RestClientResponseException) {
            // 400/409 "already exists" é o caso normal após o primeiro deploy
            if (!ex.responseBodyAsString.contains("already exists", ignoreCase = true)) {
                log.warn("[Storage] Não foi possível criar o bucket '{}' ({}): {}", bucket, ex.statusCode, ex.responseBodyAsString)
            }
        } catch (ex: RestClientException) {
            log.warn("[Storage] Supabase Storage inacessível na inicialização: {}", ex.message)
        }
    }
}
