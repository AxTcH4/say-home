package ma.sayhome.say_home_api.property.propertyMedia;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import ma.sayhome.say_home_api.property.Property;
import ma.sayhome.say_home_api.shared.exceptions.BadRequestException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class PropertyMediaServiceImpl {
    private static final int MAX_IMAGES_PER_PROPERTY = 10;

    @Autowired
    private Cloudinary cloudinary;

    @Autowired
    private PropertyMediaRepository propertyMediaRepository;

    public List<String> uploadAll(List<MultipartFile> files, Property property) throws IOException {
        long validFilesCount = files.stream().filter(file -> file != null && !file.isEmpty()).count();
        if (validFilesCount > MAX_IMAGES_PER_PROPERTY) {
            throw new BadRequestException("A property can contain up to 10 images");
        }

        List<String> results = new ArrayList<>();
        for (MultipartFile file : files) {
            if (file == null || file.isEmpty()) {
                continue;
            }
            Map result = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.emptyMap());
            String url = (String) result.get("secure_url");

            PropertyMedia media = new PropertyMedia();
            media.setUrl(url);
            media.setProperty(property);
            media.setType(file.getContentType());
            propertyMediaRepository.save(media);
            results.add(url);
        }
        return results;
    }

    public List<String> getByPropertyId(int id)  {
        List<String> results = new ArrayList<>();
        for (PropertyMedia media: propertyMediaRepository.findAllByPropertyId(id)) {
            results.add(media.getUrl());
        }
        return results;
    }

    public void deleteAllByPropertyId(Integer propertyId) {
        propertyMediaRepository.deleteAllByPropertyId(propertyId);
    }

    public List<String> replaceAll(List<MultipartFile> files, Property property) throws IOException {
        deleteAllByPropertyId(property.getId());
        return uploadAll(files, property);
    }

}
