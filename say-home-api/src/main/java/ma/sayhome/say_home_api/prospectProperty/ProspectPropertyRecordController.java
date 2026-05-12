package ma.sayhome.say_home_api.prospectProperty;

import ma.sayhome.say_home_api.prospectProperty.dto.CreateProspectPropertyRecordRequest;
import ma.sayhome.say_home_api.prospectProperty.dto.ProspectPropertyRecordResponse;
import ma.sayhome.say_home_api.prospectProperty.dto.UpdateProspectPropertyRecordRequest;
import ma.sayhome.say_home_api.shared.ApiResponse;
import ma.sayhome.say_home_api.shared.ControllerBase;
import ma.sayhome.say_home_api.shared.enums.ProspectPropertyDocumentType;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/prospect-properties")
@PreAuthorize("hasRole('ADMIN')")
public class ProspectPropertyRecordController extends ControllerBase {
    private final ProspectPropertyRecordService recordService;

    public ProspectPropertyRecordController(ProspectPropertyRecordService recordService) {
        this.recordService = recordService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProspectPropertyRecordResponse>> createRecord(
            @RequestBody CreateProspectPropertyRecordRequest request
    ) {
        return created(recordService.createRecord(request));
    }

    @PutMapping("/{recordId}")
    public ResponseEntity<ApiResponse<ProspectPropertyRecordResponse>> updateRecord(
            @PathVariable Integer recordId,
            @RequestBody UpdateProspectPropertyRecordRequest request
    ) {
        return ok(recordService.updateRecord(recordId, request));
    }

    @GetMapping("/prospect/{prospectId}")
    public ResponseEntity<ApiResponse<List<ProspectPropertyRecordResponse>>> getRecordsByProspect(
            @PathVariable Integer prospectId
    ) {
        return ok(recordService.getRecordsByProspectId(prospectId));
    }

    @DeleteMapping("/{recordId}")
    public ResponseEntity<ApiResponse<Void>> deleteRecord(@PathVariable Integer recordId) {
        recordService.deleteRecord(recordId);
        return noContent();
    }

    @PostMapping(path = "/{recordId}/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ProspectPropertyRecordResponse>> uploadDocuments(
            @PathVariable Integer recordId,
            @RequestParam ProspectPropertyDocumentType type,
            @RequestPart("files") List<MultipartFile> files
    ) throws IOException {
        return ok(recordService.addDocuments(recordId, type, files));
    }

    @DeleteMapping("/{recordId}/documents/{documentId}")
    public ResponseEntity<ApiResponse<ProspectPropertyRecordResponse>> deleteDocument(
            @PathVariable Integer recordId,
            @PathVariable Integer documentId
    ) {
        return ok(recordService.deleteDocument(recordId, documentId));
    }
}
