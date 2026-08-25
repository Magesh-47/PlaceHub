package com.placement.portal.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseSchemaFixer implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("Checking and fixing database constraints...");

        try {
            // Drop the old constraint
            jdbcTemplate.execute(
                    "ALTER TABLE job_applications DROP CONSTRAINT IF EXISTS job_applications_application_status_check");

            // Add the corrected constraint
            // Ensure this matches the enum values in JobApplication.ApplicationStatus
            String sql = "ALTER TABLE job_applications ADD CONSTRAINT job_applications_application_status_check " +
                    "CHECK (application_status IN ('PENDING', 'SUBMITTED', 'ACCEPTED', 'REJECTED'))";
            jdbcTemplate.execute(sql);

            System.out.println("Successfully updated job_applications_application_status_check constraint.");
        } catch (Exception e) {
            System.err.println("Failed to update database constraint: " + e.getMessage());
            // Don't throw exception to avoid stopping the app, just log it.
            // It might fail if table doesn't exist yet (though DDL auto usually runs first)
        }
    }
}
