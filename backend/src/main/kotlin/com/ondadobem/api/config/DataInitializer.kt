package com.ondadobem.api.config

import com.ondadobem.api.domain.entity.*
import com.ondadobem.api.domain.enums.ImpactType
import com.ondadobem.api.domain.enums.PostCategory
import com.ondadobem.api.domain.repository.*
import org.springframework.boot.CommandLineRunner
import org.springframework.context.annotation.Profile
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Component

@Component
class DataInitializer(
    private val userRepository: UserRepository,
    private val postRepository: PostRepository,
    private val commentRepository: CommentRepository,
    private val likeRepository: LikeRepository,
    private val impactRepository: ImpactRepository,
    private val passwordEncoder: PasswordEncoder
) : CommandLineRunner {

    override fun run(vararg args: String) {
        if (userRepository.count() > 0) return

        val defaultPassword = passwordEncoder.encode("senha123")!!

        // 1. Usuários iniciais
        val lucas = userRepository.save(
            UserEntity(
                email = "lucas.silva@ondadobem.org",
                username = "lucas.silva",
                displayName = "Lucas Silva",
                passwordHash = defaultPassword,
                avatarUrl = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop",
                bio = "Defensor da natureza e entusiasta de mutirões ecológicos. Criando ondas de impacto positivo todos os dias! 🌊✨",
                location = "Florianópolis, SC",
                totalActions = 16,
                totalImpact = 420,
                userRank = 4,
                rankTitle = "Guardião da Terra"
            )
        )

        val marina = userRepository.save(
            UserEntity(
                email = "marina.costa@ondadobem.org",
                username = "marina.eco",
                displayName = "Marina Costa",
                passwordHash = defaultPassword,
                avatarUrl = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop",
                bio = "Bióloga marinha e apaixonada pelo oceano. Toda pequena ação transforma o planeta. 🐢🌱",
                location = "Rio de Janeiro, RJ",
                totalActions = 28,
                totalImpact = 890,
                userRank = 5,
                rankTitle = "Líder Sustentável"
            )
        )

        val pedro = userRepository.save(
            UserEntity(
                email = "pedro.almeida@ondadobem.org",
                username = "pedro.almeida",
                displayName = "Pedro Almeida",
                passwordHash = defaultPassword,
                avatarUrl = "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop",
                bio = "Engenheiro ambiental. Plantando hoje as árvores de amanhã! 🌳🌲",
                location = "Curitiba, PR",
                totalActions = 12,
                totalImpact = 310,
                userRank = 3,
                rankTitle = "Semeador do Futuro"
            )
        )

        // 2. Publicações iniciais
        val post1 = postRepository.save(
            PostEntity(
                author = lucas,
                title = "Mutirão de Limpeza na Praia Mole 🌊",
                description = "Juntamos mais de 25 voluntários no último sábado e recolhemos 45kg de resíduos plásticos e microlixo das dunas e da faixa de areia. Nosso litoral agradece!",
                category = PostCategory.BEACH_CLEANUP,
                imageUrl = "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=800&auto=format&fit=crop",
                latitude = -27.6044,
                longitude = -48.4326,
                locationName = "Praia Mole, Florianópolis",
                likesCount = 42,
                commentsCount = 2,
                impactScore = 90
            )
        )

        val post2 = postRepository.save(
            PostEntity(
                author = marina,
                title = "Plantio de 60 Mudas Nativas da Mata Atlântica 🌱",
                description = "Ação comunitária incrível no Parque Estadual! Plantamos ipês, jacarandás e quaresmeiras para reflorestar a encosta. Cuidar é resistir.",
                category = PostCategory.TREE_PLANTING,
                imageUrl = "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop",
                latitude = -22.9519,
                longitude = -43.2105,
                locationName = "Parque da Tijuca, Rio de Janeiro",
                likesCount = 68,
                commentsCount = 1,
                impactScore = 150
            )
        )

        val post3 = postRepository.save(
            PostEntity(
                author = pedro,
                title = "Ponto de Coleta de Eletrônicos no Bairro ♻️",
                description = "Conseguimos arrecadar mais de 120kg de computadores velhos, baterias e cabos que agora terão descarte correto e seguro, sem contaminar o solo!",
                category = PostCategory.RECYCLING,
                imageUrl = "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&auto=format&fit=crop",
                latitude = -25.4284,
                longitude = -49.2733,
                locationName = "Batel, Curitiba",
                likesCount = 35,
                commentsCount = 0,
                impactScore = 70
            )
        )

        // 3. Curtidas e Comentários
        likeRepository.save(LikeEntity(user = marina, post = post1))
        likeRepository.save(LikeEntity(user = pedro, post = post1))
        likeRepository.save(LikeEntity(user = lucas, post = post2))

        commentRepository.save(
            CommentEntity(
                author = marina,
                post = post1,
                content = "Parabéns equipe! Trabalho espetacular na Praia Mole! 👏💚"
            )
        )
        commentRepository.save(
            CommentEntity(
                author = pedro,
                post = post1,
                content = "No próximo mutirão podem contar comigo com certeza!"
            )
        )
        commentRepository.save(
            CommentEntity(
                author = lucas,
                post = post2,
                content = "Que orgulho dessa iniciativa! As mudas ficaram lindas!"
            )
        )

        // 4. Métricas de Impacto
        impactRepository.save(
            ImpactEntity(
                user = lucas,
                post = post1,
                type = ImpactType.TRASH_COLLECTED,
                value = 45.0,
                unit = "kg",
                description = "Limpeza na Praia Mole"
            )
        )
        impactRepository.save(
            ImpactEntity(
                user = marina,
                post = post2,
                type = ImpactType.TREES_PLANTED,
                value = 60.0,
                unit = "árvores",
                description = "Reflorestamento Tijuca"
            )
        )
        impactRepository.save(
            ImpactEntity(
                user = pedro,
                post = post3,
                type = ImpactType.ITEMS_RECYCLED,
                value = 120.0,
                unit = "kg",
                description = "E-lixo reciclado"
            )
        )
    }
}
