package com.app.weather.repository;

import com.app.weather.model.Favorite;
import com.app.weather.model.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    List<Favorite> findByUserOrderByCreatedAtDesc(User user);

    Optional<Favorite> findByUserAndCityIgnoreCase(User user, String city);

    void deleteByUserAndCityIgnoreCase(User user, String city);

    void deleteByUser(User user);
}
