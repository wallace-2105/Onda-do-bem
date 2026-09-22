package com.ondadobem.api.dto

import java.time.Instant

/**
 * Resposta padrão de sucesso da API (ApiResponse<T>)
 */
data class ApiResponse<T>(
    val data: T,
    val message: String? = null,
    val timestamp: String = Instant.now().toString()
)

/**
 * Resposta paginada da API (PaginatedResponse<T>)
 */
data class PaginatedResponse<T>(
    val data: List<T>,
    val meta: PaginationMeta
)

/**
 * Metadados de paginação (PaginationMeta)
 */
data class PaginationMeta(
    val currentPage: Int,
    val totalPages: Int,
    val totalItems: Long,
    val itemsPerPage: Int,
    val hasNextPage: Boolean,
    val hasPreviousPage: Boolean
)

/**
 * Estrutura de erro retornada pela API (ApiError)
 */
data class ApiError(
    val statusCode: Int,
    val message: String,
    val error: String,
    val details: Map<String, List<String>>? = null,
    val timestamp: String = Instant.now().toString()
)
