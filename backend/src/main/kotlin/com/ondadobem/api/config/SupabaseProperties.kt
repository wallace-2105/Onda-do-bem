package com.ondadobem.api.config

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.context.annotation.Configuration

@Configuration
@ConfigurationProperties(prefix = "app.supabase")
class SupabaseProperties {
    // Ex: https://<project-ref>.supabase.co
    var url: String = ""
    // Chave service_role (somente no servidor — nunca expor no frontend)
    var serviceRoleKey: String = ""
    var storageBucket: String = "post-images"
}
