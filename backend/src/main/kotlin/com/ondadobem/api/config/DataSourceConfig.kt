package com.ondadobem.api.config

import com.zaxxer.hikari.HikariDataSource
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Primary
import org.springframework.context.annotation.Profile
import javax.sql.DataSource

@Configuration
@Profile("!test")
class DataSourceConfig {


    private val logger = LoggerFactory.getLogger(DataSourceConfig::class.java)

    @Value("\${SUPABASE_DB_URL:}")
    private val envUrl: String = ""

    @Value("\${SUPABASE_DB_USER:}")
    private val envUser: String = ""

    @Value("\${SUPABASE_DB_PASSWORD:}")
    private val envPassword: String = ""

    @Bean
    @Primary
    fun dataSource(): DataSource {
        val defaultUrl = "jdbc:postgresql://aws-1-sa-east-1.pooler.supabase.com:5432/postgres?sslmode=require"
        val defaultUser = "postgres.fljmkiiffvkdciysweme"
        val defaultPass = "123ondadobem"

        val finalUrl = if (envUrl.isNotBlank()) envUrl.trim() else defaultUrl
        val finalUser = if (envUser.isNotBlank()) envUser.trim() else defaultUser
        val finalPass = if (envPassword.isNotBlank()) envPassword.trim() else defaultPass

        logger.info("Configurando DataSource principal para URL: {}", finalUrl)

        return HikariDataSource().apply {
            jdbcUrl = finalUrl
            username = finalUser
            password = finalPass
            driverClassName = "org.postgresql.Driver"
            maximumPoolSize = 5
            minimumIdle = 1
            idleTimeout = 300000
            connectionTimeout = 30000
            maxLifetime = 600000
        }
    }
}
