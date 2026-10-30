package com.ondadobem.api

import com.ondadobem.api.config.JwtProperties
import com.ondadobem.api.config.JwtService
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import java.util.UUID

@SpringBootTest
@ActiveProfiles("test")
class OndadobemApiApplicationTests {

	@Test
	fun contextLoads() {
	}

	@Test
	fun `deve suportar chaves curtas de 128 bits geradas por servicos de nuvem sem lancar WeakKeyException`() {
		val props = JwtProperties().apply {
			secret = "16_char_secret!!" // exatamente 16 bytes = 128 bits
		}
		val jwtService = JwtService(props)
		val token = jwtService.generateAccessToken(UUID.randomUUID(), "teste@ondadobem.org")
		assertNotNull(token)
		assertTrue(jwtService.isTokenValid(token))
	}

}
