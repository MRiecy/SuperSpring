package com.example.superspring;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.example.superspring.mapper")
public class SuperSpringApplication {

    public static void main(String[] args) {
        SpringApplication.run(SuperSpringApplication.class, args);
    }

}
