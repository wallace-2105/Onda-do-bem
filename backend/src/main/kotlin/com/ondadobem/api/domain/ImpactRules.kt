package com.ondadobem.api.domain

/**
 * Regra única de pontos de impacto:
 * - cada publicação vale um valor fixo para o autor
 * - cada curtida recebida de OUTRO usuário vale pontos extras (curtir o próprio post não conta)
 *
 * O app usa os mesmos valores em src/utils/rank.ts.
 */
object ImpactRules {
    const val POINTS_PER_POST = 20
    const val POINTS_PER_LIKE = 2
}
