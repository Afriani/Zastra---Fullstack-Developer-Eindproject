package com.zastra.zastra.infra.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.Resource;
import org.springframework.jdbc.datasource.init.DatabasePopulatorUtils;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;

@Component
@Profile("dev")
public class MultiDataSourceInitializer implements ApplicationRunner {

    private final DataSource zastraDataSource;
    private final DataSource mediaDataSource;

    @Value("classpath:schema-zastra.sql")
    private Resource schemaZastra;

    @Value("classpath:data-zastra.sql")
    private Resource dataZastra;

    @Value("classpath:schema-media.sql")
    private Resource schemaMedia;

    @Value("classpath:data-media.sql")
    private Resource dataMedia;

    public MultiDataSourceInitializer(
            @Qualifier("zastraDataSource") DataSource zastraDataSource,
            @Qualifier("mediaDataSource") DataSource mediaDataSource) {
        this.zastraDataSource = zastraDataSource;
        this.mediaDataSource = mediaDataSource;
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        executeScripts(zastraDataSource, schemaZastra, dataZastra, "zastra");
        executeScripts(mediaDataSource, schemaMedia, dataMedia, "media");
    }

    private void executeScripts(DataSource ds, Resource schema, Resource data, String name) {
        try {
            ResourceDatabasePopulator populator = new ResourceDatabasePopulator();
            if (schema != null && schema.exists()) populator.addScript(schema);
            if (data != null && data.exists()) populator.addScript(data);
            populator.setContinueOnError(true); // safe for repeated runs
            DatabasePopulatorUtils.execute(populator, ds);
            System.out.println("Database init for '" + name + "' executed (if resources present).");
        } catch (Exception e) {
            System.err.println("Error while initializing datasource '" + name + "': " + e.getMessage());
            e.printStackTrace();
        }
    }

}
