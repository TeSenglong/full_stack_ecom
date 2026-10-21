package com.example.backend;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("postgres-test")
@Testcontainers(disabledWithoutDocker = true)
class PostgresMigrationIntegrationTests {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void flywayCreatesAndHibernateValidatesThePostgresSchema() {
        Integer applicationTableCount = jdbcTemplate.queryForObject(
                """
                        select count(*)
                        from information_schema.tables
                        where table_schema = 'public'
                          and table_name in (
                              'users', 'categories', 'products',
                              'cart_items', 'orders', 'order_items'
                          )
                        """,
                Integer.class
        );

        Integer successfulMigrationCount = jdbcTemplate.queryForObject(
                "select count(*) from flyway_schema_history where success = true",
                Integer.class
        );

        assertThat(applicationTableCount).isEqualTo(6);
        assertThat(successfulMigrationCount).isEqualTo(3);
    }
}
