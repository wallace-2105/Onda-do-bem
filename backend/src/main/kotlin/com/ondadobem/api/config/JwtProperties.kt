package com.ondadobem.api.config

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.context.annotation.Configuration

@Configuration
@ConfigurationProperties(prefix = "app.jwt")
class JwtProperties {
    var secret: String = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970"
    var accessTokenExpirationMs: Long = 86400000 // 24h
    var refreshTokenExpirationMs: Long = 604800000 // 7 dias
}
