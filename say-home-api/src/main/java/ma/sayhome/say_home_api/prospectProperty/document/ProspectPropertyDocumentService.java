package ma.sayhome.say_home_api.prospectProperty.document;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import ma.sayhome.say_home_api.prospectProperty.ProspectPropertyRecord;
import ma.sayhome.say_home_api.shared.enums.Role;
import ma.sayhome.say_home_api.shared.enums.ProspectPropertyDocumentType;
import ma.sayhome.say_home_api.shared.exceptions.UnauthorizedException;
import ma.sayhome.say_home_api.user.User;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.URLDecoder;
import java.net.URL;
import java.nio.charset.StandardCharsets;
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

            validatePdfFile(file);

            Map<?, ?> uploaded = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "resource_type", "raw",
                            "folder", "say_home/prospect_documents",
                            "use_filename", true,
                            "unique_filename", true,
                            "filename_override", file.getOriginalFilename()
                    )
            );
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

    public ProspectPropertyDocument uploadGeneratedPdf(
            byte[] content,
            String fileName,
            ProspectPropertyRecord record,
            ProspectPropertyDocumentType type
    ) throws IOException {
        String normalizedFileName = normalizePdfFileName(fileName);
        String publicId = stripPdfExtension(normalizedFileName);

        Map<?, ?> uploaded = cloudinary.uploader().upload(
                content,
                ObjectUtils.asMap(
                        "resource_type", "raw",
                        "public_id", "say_home/documents/" + record.getId() + "/" + publicId,
                        "filename_override", normalizedFileName,
                        "use_filename", true,
                        "unique_filename", false,
                        "content_type", "application/pdf"
                )
        );
        String url = (String) uploaded.get("secure_url");

        ProspectPropertyDocument document = new ProspectPropertyDocument();
        document.setRecord(record);
        document.setName(normalizedFileName);
        document.setUrl(url);
        document.setType(type);
        return documentRepository.save(document);
    }

    public void deleteById(Integer documentId) {
        documentRepository.deleteById(documentId);
    }

    public ProspectPropertyDocument getRequiredDocument(Integer documentId) {
        return documentRepository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException("Document introuvable."));
    }

    public ProspectPropertyDocument getRequiredDocumentForUser(Integer documentId, User user) {
        ProspectPropertyDocument document = getRequiredDocument(documentId);
        if (user == null) {
            throw new UnauthorizedException("User is not authenticated");
        }

        if (user.getRole() == Role.ADMIN) {
            return document;
        }

        if (user.getRole() == Role.CLIENT
                && document.getRecord() != null
                && document.getRecord().getProspect() != null
                && document.getRecord().getProspect().getEmail() != null
                && document.getRecord().getProspect().getEmail().equalsIgnoreCase(user.getEmail())) {
            return document;
        }

        throw new UnauthorizedException("You are not allowed to access this document");
    }

    public byte[] downloadDocument(Integer documentId) throws IOException {
        ProspectPropertyDocument document = getRequiredDocument(documentId);
        IOException lastError = null;

        for (String candidateUrl : buildDownloadCandidates(document)) {
            try (InputStream inputStream = new URL(candidateUrl).openStream()) {
                return inputStream.readAllBytes();
            } catch (IOException exception) {
                lastError = exception;
            }
        }

        if (lastError != null) {
            throw lastError;
        }

        throw new IOException("Impossible de telecharger le document.");
    }

    private void validatePdfFile(MultipartFile file) {
        String fileName = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().toLowerCase();
        String contentType = file.getContentType() == null ? "" : file.getContentType().toLowerCase();
        boolean isPdf = fileName.endsWith(".pdf") || "application/pdf".equals(contentType);

        if (!isPdf) {
            throw new IllegalArgumentException("Seuls les fichiers PDF sont autorises.");
        }
    }

    private List<String> buildDownloadCandidates(ProspectPropertyDocument document) {
        String url = document.getUrl();
        if (url == null || url.isBlank()) {
            return List.of();
        }

        List<String> candidates = new ArrayList<>();
        candidates.add(url);

        String normalizedUrl = url.replace(".pdf.pdf", ".pdf");
        if (!normalizedUrl.equals(url)) {
            candidates.add(normalizedUrl);
        }

        if (isPdfDocument(document)) {
            for (String publicId : extractPublicIdCandidates(normalizedUrl)) {
                try {
                    candidates.add(cloudinary.privateDownload(
                            publicId,
                            "pdf",
                            ObjectUtils.asMap(
                                    "resource_type", "raw",
                                    "type", "upload"
                            )
                    ));
                } catch (Exception ignored) {
                    // We keep trying the remaining delivery strategies below.
                }
            }
        }

        boolean isPdf = isPdfDocument(document);
        if (isPdf) {
            if (normalizedUrl.contains("/image/upload/")) {
                candidates.add(normalizedUrl.replace("/image/upload/", "/raw/upload/"));
                candidates.add(normalizedUrl.replace("/image/upload/", "/raw/upload/fl_attachment/"));
            } else if (normalizedUrl.contains("/raw/upload/")) {
                candidates.add(normalizedUrl.replace("/raw/upload/", "/raw/upload/fl_attachment/"));
            }
        }

        return candidates.stream().distinct().toList();
    }

    private boolean isPdfDocument(ProspectPropertyDocument document) {
        return document.getName() != null && document.getName().toLowerCase().endsWith(".pdf");
    }

    private String normalizePdfFileName(String fileName) {
        if (fileName == null || fileName.isBlank()) {
            return "document.pdf";
        }

        return fileName.toLowerCase().endsWith(".pdf") ? fileName : fileName + ".pdf";
    }

    private String stripPdfExtension(String fileName) {
        if (fileName == null) {
            return "document";
        }

        return fileName.toLowerCase().endsWith(".pdf")
                ? fileName.substring(0, fileName.length() - 4)
                : fileName;
    }

    private List<String> extractPublicIdCandidates(String url) {
        int uploadIndex = url.indexOf("/upload/");
        if (uploadIndex < 0) {
            return List.of();
        }

        String path = url.substring(uploadIndex + "/upload/".length());
        int queryIndex = path.indexOf('?');
        if (queryIndex >= 0) {
            path = path.substring(0, queryIndex);
        }

        path = path.replaceFirst("^fl_attachment/", "");
        path = path.replaceFirst("^v\\d+/", "");
        path = URLDecoder.decode(path, StandardCharsets.UTF_8);
        path = path.replace(".pdf.pdf", ".pdf");

        List<String> candidates = new ArrayList<>();
        candidates.add(stripPdfExtension(path));
        candidates.add(path);
        return candidates.stream()
                .filter(value -> value != null && !value.isBlank())
                .distinct()
                .toList();
    }
}
