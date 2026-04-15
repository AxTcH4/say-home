package ma.sayhome.say_home_api.property.propertyMedia;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import ma.sayhome.say_home_api.property.Property;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class PropertyMediaServiceImp {
    @Autowired
    private Cloudinary cloudinary;

    @Autowired
    private PropertyMediaRepository propertyMediaRepository;

    public List<String> uploadAll(List<MultipartFile> files, Property property) throws IOException {
        List<String> results = new ArrayList<>();
        for (MultipartFile file : files) {
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
        for (PropertyMedia media: propertyMediaRepository.findAll()) {
            if (media.getProperty().getId().equals(id)) {
                results.add(media.getUrl());
            }
        }
        return results;
    }

}
