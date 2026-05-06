package com.example.SpringBootApp;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = "spring.jpa.hibernate.ddl-auto=none")
@Disabled("Requires database to be running with V2 schema")
class JuniorPrimeBeefApplicationTests {

	@Test
	void contextLoads() {
	}

}
