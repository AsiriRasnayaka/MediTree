package com.meditree.meditree_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MediTreeApplication {

	public static void main(String[] args) {
		SpringApplication.run(MediTreeApplication.class, args);
		System.out.println("✅ MediTree Backend is running on http://localhost:8080");
		System.out.println("📡 API ready at http://localhost:8080/api");
	}


}
