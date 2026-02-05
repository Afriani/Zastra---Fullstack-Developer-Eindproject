package com.zastra.zastra.integration;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles; // Import this
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class ApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void testPublicController__testEndpoint_returnsOk() throws Exception {
        mockMvc.perform(get("/__test"))
                .andExpect(status().isOk())
                .andExpect(content().string("ok"));
    }

    @Test
    void v3ApiDocs_isAvailable() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("\"openapi\"")));
    }

}


