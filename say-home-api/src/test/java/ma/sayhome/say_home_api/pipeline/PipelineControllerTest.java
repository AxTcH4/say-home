package ma.sayhome.say_home_api.pipeline;

import ma.sayhome.say_home_api.pipeline.dto.UpdatePipelineStatusRequest;
import ma.sayhome.say_home_api.pipeline.dto.PipelineBoardResponse;
import ma.sayhome.say_home_api.shared.ApiResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PipelineControllerTest {

    private PipelineServiceImpl pipelineService;
    private PipelineController controller;

    @BeforeEach
    void setUp() {
        pipelineService = mock(PipelineServiceImpl.class);
        controller = new PipelineController(pipelineService);
    }

    @Test
    void getBoard_shouldForwardFilters() {
        when(pipelineService.getBoard("John", "Marrakech", "Website"))
                .thenReturn(new PipelineBoardResponse(null, null, "now"));

        var response = controller.getBoard("John", "Marrakech", "Website");
        ApiResponse<?> body = (ApiResponse<?>) response.getBody();

        assertNotNull(body);
        assertTrue(body.isSuccess());
        assertEquals("now", ((PipelineBoardResponse) body.getData()).lastUpdated());
    }

    @Test
    void updateProspectStatus_shouldDelegateRequestedStatus() {
        UpdatePipelineStatusRequest request = new UpdatePipelineStatusRequest();
        request.status = "QUALIFIED";
        when(pipelineService.updateProspectStatus(4, "QUALIFIED"))
                .thenReturn(new PipelineBoardResponse(null, null, "updated"));

        var response = controller.updateProspectStatus(4, request);
        ApiResponse<?> body = (ApiResponse<?>) response.getBody();

        assertNotNull(body);
        assertTrue(body.isSuccess());
        verify(pipelineService).updateProspectStatus(4, "QUALIFIED");
    }
}
