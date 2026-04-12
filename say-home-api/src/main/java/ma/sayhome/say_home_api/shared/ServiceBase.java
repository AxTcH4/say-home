package ma.sayhome.say_home_api.shared;

import java.util.List;

public interface ServiceBase<T, ID> {
    T create(T entity);
    T findById(ID id);
    List<T> findAll();
    T update(ID id, T entity);
    void delete(ID id);
}