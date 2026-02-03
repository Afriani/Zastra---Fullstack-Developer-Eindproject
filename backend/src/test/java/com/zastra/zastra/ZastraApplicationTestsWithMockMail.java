package com.zastra.zastra;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;

@SpringBootTest
@Import(TestMailConfig.class)
public class ZastraApplicationTestsWithMockMail extends ZastraApplicationTests {

    @Test
    void contextLoads() {
        super.contextLoads();  // Run the original test
    }

}


