package com.ondadobem.api.config

import com.ondadobem.api.domain.ImpactRules
import org.slf4j.LoggerFactory
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.context.event.EventListener
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional

/**
 * Recalcula os pontos de impacto a partir dos dados reais ao iniciar o backend:
 *   impacto do usuário = POINTS_PER_POST × publicações + POINTS_PER_LIKE × curtidas recebidas de outros
 *
 * É idempotente (o resultado só depende de posts e curtidas), então rodar a cada
 * deploy mantém o ranking consistente e corrige valores antigos fora da regra.
 */
@Component
class ImpactRecalculator(
    private val jdbcTemplate: JdbcTemplate
) {
    private val logger = LoggerFactory.getLogger(ImpactRecalculator::class.java)

    @EventListener(ApplicationReadyEvent::class)
    @Transactional
    fun recalculate() {
        try {
            // Contadores exibidos nos posts = registros reais de curtidas/comentários
            // (dados semeados tinham números fictícios que não batiam com os pontos)
            val countersFixed = jdbcTemplate.update(
                """
                UPDATE posts SET
                    likes_count = (SELECT COUNT(*) FROM likes l WHERE l.post_id = posts.id),
                    comments_count = (SELECT COUNT(*) FROM comments c WHERE c.post_id = posts.id)
                WHERE likes_count <> (SELECT COUNT(*) FROM likes l WHERE l.post_id = posts.id)
                   OR comments_count <> (SELECT COUNT(*) FROM comments c WHERE c.post_id = posts.id)
                """.trimIndent()
            )

            val postsFixed = jdbcTemplate.update(
                "UPDATE posts SET impact_score = ? WHERE impact_score <> ?",
                ImpactRules.POINTS_PER_POST,
                ImpactRules.POINTS_PER_POST
            )

            val usersUpdated = jdbcTemplate.update(
                """
                UPDATE users SET
                    total_actions = (SELECT COUNT(*) FROM posts p WHERE p.author_id = users.id),
                    total_impact =
                        ? * (SELECT COUNT(*) FROM posts p WHERE p.author_id = users.id)
                      + ? * (SELECT COUNT(*) FROM likes l
                               JOIN posts p ON p.id = l.post_id
                              WHERE p.author_id = users.id AND l.user_id <> users.id)
                """.trimIndent(),
                ImpactRules.POINTS_PER_POST,
                ImpactRules.POINTS_PER_LIKE
            )

            logger.info(
                "[Impacto] Recalculado: {} posts com contadores corrigidos, {} posts ajustados para {} pts, {} usuários atualizados",
                countersFixed, postsFixed, ImpactRules.POINTS_PER_POST, usersUpdated
            )
        } catch (e: Exception) {
            // Não impede o backend de subir; o ranking só fica desatualizado até o próximo deploy
            logger.error("[Impacto] Falha ao recalcular pontos de impacto", e)
        }
    }
}
