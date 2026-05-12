package ma.sayhome.say_home_api.prospectProperty.document;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import ma.sayhome.say_home_api.prospectProperty.ProspectPropertyRecord;
import ma.sayhome.say_home_api.shared.enums.ProspectPropertyDocumentType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class ProspectPropertyDocumentService {
    private final Cloudinary cloudinary;
    private final ProspectPropertyDocumentRepository documentRepository;

    public ProspectPropertyDocumentService(
            Cloudinary cloudinary,
            ProspectPropertyDocumentRepository documentRepository
    ) {
        this.cloudinary = cloudinary;
        this.documentRepository = documentRepository;
    }

    public List<ProspectPropertyDocument> uploadAll(
            List<MultipartFile> files,
            ProspectPropertyRecord record,
            ProspectPropertyDocumentType type
    ) throws IOException {
        List<ProspectPropertyDocument> results = new ArrayList<>();
        for (MultipartFile file : files) {
            if (file == null || file.isEmpty()) {
                continue;
            }

            Map<?, ?> uploaded = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.emptyMap());
            String url = (String) uploaded.get("secure_url");

            ProspectPropertyDocument document = new ProspectPropertyDocument();
            document.setRecord(record);
            document.setName(file.getOriginalFilename() != null ? file.getOriginalFilename() : "document");
            document.setUrl(url);
            document.setType(type);
            results.add(documentRepository.save(document));
        }
        return results;
    }

    public void deleteById(Integer documentId) {
        documentRepository.deleteById(documentId);
    }
}
