package ma.sayhome.say_home_api.globalSearch;

import ma.sayhome.say_home_api.globalSearch.dto.SearchResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class GlobalSearchControllerTest {

    private GlobalSearchService globalSearchService;
    private GlobalSearchController controller;

    @BeforeEach
    void setUp() {
        globalSearchService = org.mockito.Mockito.mock(GlobalSearchService.class);
        controller = new GlobalSearchController();
        ReflectionTestUtils.setField(controller, "globalSearchService", globalSearchService);
    }

    @Test
    void getGlobalSearchProperties_shouldDelegateToService() throws Exception {
        SearchResponse response = new SearchResponse();
        org.mockito.Mockito.when(globalSearchService.findRelatedItems("villa")).thenReturn(response);

        var entity = controller.getGlobalSearchProperties("villa");

        assertTrue(entity.getBody().isSuccess());
        assertSame(response, entity.getBody().getData());
    }
}
