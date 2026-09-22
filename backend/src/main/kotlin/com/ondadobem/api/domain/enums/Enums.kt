package com.ondadobem.api.domain.enums

/**
 * Categorias de ações positivas correspondentes ao enum do frontend (PostCategory)
 */
enum class PostCategory {
    BEACH_CLEANUP,
    TREE_PLANTING,
    RECYCLING,
    WATER_CONSERVATION,
    COMMUNITY_GARDEN,
    ANIMAL_RESCUE,
    DONATION,
    EDUCATION,
    OTHER
}

/**
 * Tipos de notificação (NotificationType)
 */
enum class NotificationType {
    LIKE,
    COMMENT,
    FOLLOW,
    MENTION,
    IMPACT_MILESTONE,
    SYSTEM
}

/**
 * Tipos de impacto mensuráveis (ImpactType)
 */
enum class ImpactType {
    TRASH_COLLECTED,
    TREES_PLANTED,
    WATER_SAVED,
    AREA_CLEANED,
    PEOPLE_HELPED,
    ANIMALS_RESCUED,
    ITEMS_RECYCLED,
    ITEMS_DONATED
}
