package ma.sayhome.say_home_api.wish;

import ma.sayhome.say_home_api.shared.ApiResponse;
import ma.sayhome.say_home_api.wish.dto.ProspectWishFormResponse;
import ma.sayhome.say_home_api.wish.dto.SubmitProspectWishRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class WantedPropertyControllerTest {

    private WantedPropertyService wantedPropertyService;
    private WantedPropertyController controller;

    @BeforeEach
    void setUp() {
        wantedPropertyService = mock(WantedPropertyService.class);
        controller = new WantedPropertyController(wantedPropertyService);
    }

    @Test
    void getWishForm_shouldReturnPublicForm() {
        ProspectWishFormResponse response = new ProspectWishFormResponse("token-1", "Alice Doe", "Villa Atlas", false);
        when(wantedPropertyService.getPublicForm("token-1")).thenReturn(response);

        var entity = controller.getWishForm("token-1");
        ApiResponse<?> body = (ApiResponse<?>) entity.getBody();

        assertNotNull(body);
        assertTrue(body.isSuccess());
        assertEquals("token-1", ((ProspectWishFormResponse) body.getData()).token());
    }

    @Test
    void submitWish_shouldDelegatePayload() {
        SubmitProspectWishRequest request = new SubmitProspectWishRequest();
        request.type = "villa";
        ProspectWishFormResponse response = new ProspectWishFormResponse("token-1", "Alice Doe", "Villa Atlas", true);
        when(wantedPropertyService.submit("token-1", request)).thenReturn(response);

        var entity = controller.submitWish("token-1", request);
        ApiResponse<?> body = (ApiResponse<?>) entity.getBody();

        assertNotNull(body);
        assertTrue(body.isSuccess());
        assertTrue(((ProspectWishFormResponse) body.getData()).submitted());
    }
}
