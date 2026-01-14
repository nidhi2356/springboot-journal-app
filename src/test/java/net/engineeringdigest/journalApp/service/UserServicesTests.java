package net.engineeringdigest.journalApp.service;

import net.engineeringdigest.journalApp.repository.UserRepository;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertEquals;

import static org.junit.jupiter.api.Assertions.assertNotNull;
/*
@Disabled
@SpringBootTest
public class UserServicesTests {

    @Autowired
    private UserRepository userRepository;
}

 */



    /*
    @BeforeEach => used to implement the method under this in each test performed
    @BeforeAll => implement only one time before running the whole test
    similarly
    @AfterALl
    @AfterEach
     */

    /*
    @Disabled
    @Test
    public void testFindByUserName(){
        //assertEquals(4,2+2);
        assertNotNull(userRepository.findByUserName("kamal"));
    }

    @Disabled
    @ParameterizedTest
    @CsvSource({
            "1,1,2",
            "4,2,6",
            "2,3,4"
    })
    public void test(int a,int b,int expected){
        assertEquals(expected,a+b);
    }
}
*/
