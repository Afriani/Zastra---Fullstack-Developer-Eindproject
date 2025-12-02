package com.zastra.zastra.infra.config;

import jakarta.persistence.EntityManagerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.orm.jpa.EntityManagerFactoryBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.jdbc.core.JdbcTemplate;
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
        basePackages = "com.zastra.zastra.media.repo",
        entityManagerFactoryRef = "mediaEntityManagerFactory",
        transactionManagerRef = "mediaTransactionManager"
)
public class MediaDataSourceConfig {

    private final Environment env;

    public MediaDataSourceConfig(Environment env) {
        this.env = env;
    }

    /**
     * Secondary DataSource Properties for Media DB
     * Maps to: spring.datasource.media.*
     */
    @Bean(name = "mediaDataSourceProperties")
    @ConfigurationProperties(prefix = "spring.datasource.media")
    public DataSourceProperties mediaDataSourceProperties() {
        return new DataSourceProperties();
    }

    /**
     * Secondary DataSource Bean for Media DB
     */
    @Bean(name = "mediaDataSource")
    public DataSource mediaDataSource(
            @Qualifier("mediaDataSourceProperties") DataSourceProperties props) {
        return props.initializeDataSourceBuilder().build();
    }

    /**
     * Secondary EntityManagerFactory for Media DB
     * Handles: File uploads, media storage, etc.
     */
    @Bean(name = "mediaEntityManagerFactory")
    public LocalContainerEntityManagerFactoryBean mediaEntityManagerFactory(
            EntityManagerFactoryBuilder builder,
            @Qualifier("mediaDataSource") DataSource dataSource) {

        Map<String, Object> jpaProps = new HashMap<>();
        // Read ddl-auto from properties: spring.jpa.media.hibernate.ddl-auto -> spring.jpa.hibernate.ddl-auto -> default "none"
        String hbm2ddlMedia = env.getProperty("spring.jpa.media.hibernate.ddl-auto",
                env.getProperty("spring.jpa.hibernate.ddl-auto", "none"));
        jpaProps.put("hibernate.hbm2ddl.auto", hbm2ddlMedia);

        // Read dialect from properties, with fallbacks
        String dialect = env.getProperty("spring.jpa.database-platform",
                env.getProperty("spring.jpa.media.properties.hibernate.dialect",
                        "org.hibernate.dialect.PostgreSQLDialect"));
        jpaProps.put("hibernate.dialect", dialect);

        jpaProps.put("hibernate.show_sql", true);
        jpaProps.put("hibernate.format_sql", true);
        jpaProps.put("hibernate.jdbc.batch_size", 20);
        jpaProps.put("hibernate.order_inserts", true);
        jpaProps.put("hibernate.order_updates", true);

        return builder
                .dataSource(dataSource)
                .packages("com.zastra.zastra.media.entity")
                .persistenceUnit("mediaPU")
                .properties(jpaProps)
                .build();
    }

    /**
     * Secondary TransactionManager for Media DB
     * Uses the factory bean's object to avoid bean-type mismatches.
     */
    @Bean(name = "mediaTransactionManager")
    public PlatformTransactionManager mediaTransactionManager(
            @Qualifier("mediaEntityManagerFactory") LocalContainerEntityManagerFactoryBean mediaEntityManagerFactoryBean) {

        EntityManagerFactory emf = mediaEntityManagerFactoryBean.getObject();
        JpaTransactionManager txManager = new JpaTransactionManager();
        txManager.setEntityManagerFactory(emf);
        return txManager;
    }

    /**
     * JdbcTemplate for direct JDBC access to media DB (optional).
     * Useful for streaming blobs or simple insert/select using DataSource.
     */
    @Bean(name = "mediaJdbcTemplate")
    public JdbcTemplate mediaJdbcTemplate(@Qualifier("mediaDataSource") DataSource mediaDataSource) {
        return new JdbcTemplate(mediaDataSource);
    }

}



