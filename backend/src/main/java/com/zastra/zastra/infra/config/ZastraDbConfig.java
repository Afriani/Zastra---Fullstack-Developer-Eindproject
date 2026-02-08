package com.zastra.zastra.infra.config;

import jakarta.persistence.EntityManagerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.orm.jpa.EntityManagerFactoryBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.env.Environment;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import javax.sql.DataSource;
import java.util.HashMap;
import java.util.Map;

@Configuration
@EnableTransactionManagement
@EnableJpaRepositories(
        basePackages = "com.zastra.zastra.infra.repository",
        entityManagerFactoryRef = "zastraEntityManagerFactory",
        transactionManagerRef = "zastraTransactionManager"
)
public class ZastraDbConfig {

    private final Environment env;

    public ZastraDbConfig(Environment env) {
        this.env = env;
    }

    /**
     * Primary DataSource Properties for Zastra DB
     * Maps to: spring.datasource.zastra.*
     */
    @Primary
    @Bean(name = "zastraDataSourceProperties")
    @ConfigurationProperties(prefix = "spring.datasource.zastra")
    public DataSourceProperties zastraDataSourceProperties() {
        return new DataSourceProperties();
    }

    /**
     * Primary DataSource Bean for Zastra DB
     */
    @Primary
    @Bean(name = "zastraDataSource")
    public DataSource zastraDataSource(
            @Qualifier("zastraDataSourceProperties") DataSourceProperties props) {
        return props.initializeDataSourceBuilder().build();
    }

    /**
     * Primary EntityManagerFactory for Zastra DB
     * Handles: Users, Roles, Reports, Auth, etc.
     */
    @Primary
    @Bean(name = "zastraEntityManagerFactory")
    public LocalContainerEntityManagerFactoryBean zastraEntityManagerFactory(
            EntityManagerFactoryBuilder builder,
            @Qualifier("zastraDataSource") DataSource dataSource) {

        Map<String, Object> jpaProps = new HashMap<>();
        // Read ddl-auto from properties: spring.jpa.zastra.hibernate.ddl-auto -> spring.jpa.hibernate.ddl-auto -> default "none"
        String hbm2ddlZastra = env.getProperty("spring.jpa.zastra.hibernate.ddl-auto",
                env.getProperty("spring.jpa.hibernate.ddl-auto", "none"));
        jpaProps.put("hibernate.hbm2ddl.auto", hbm2ddlZastra);

        // Read dialect from properties, with fallbacks
        String dialect = env.getProperty("spring.jpa.database-platform",
                env.getProperty("spring.jpa.zastra.properties.hibernate.dialect",
                        "org.hibernate.dialect.PostgreSQLDialect"));
        jpaProps.put("hibernate.dialect", dialect);

        jpaProps.put("hibernate.show_sql", true);
        jpaProps.put("hibernate.format_sql", true);
        jpaProps.put("hibernate.jdbc.batch_size", 20);
        jpaProps.put("hibernate.order_inserts", true);
        jpaProps.put("hibernate.order_updates", true);

        return builder
                .dataSource(dataSource)
                .packages("com.zastra.zastra.infra.entity")
                .persistenceUnit("zastraPU")
                .properties(jpaProps)
                .build();
    }

    /**
     * Primary TransactionManager for Zastra DB
     */
    @Primary
    @Bean(name = "zastraTransactionManager")
    public PlatformTransactionManager zastraTransactionManager(
            @Qualifier("zastraEntityManagerFactory") EntityManagerFactory emf) {
        return new JpaTransactionManager(emf);
    }

}


