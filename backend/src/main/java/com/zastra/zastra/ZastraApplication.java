package com.zastra.zastra;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;

@SpringBootApplication(
        exclude = {

                DataSourceAutoConfiguration.class

        }
)
public class ZastraApplication {

    public static void main(String[] args) {

        SpringApplication.run(ZastraApplication.class, args);

    }

}



