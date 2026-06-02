package com.app.weather.service;

import com.app.weather.model.Favorite;
import com.app.weather.model.User;
import com.app.weather.repository.FavoriteRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final AuthService authService;
    private final FavoriteRepository favoriteRepository;

    public UserService(AuthService authService, FavoriteRepository favoriteRepository) {
        this.authService = authService;
        this.favoriteRepository = favoriteRepository;
    }

    @Transactional(readOnly = true)
    public List<FavoriteResponse> favorites() {
        User user = authService.currentUser();
        return favoriteRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(favorite -> new FavoriteResponse(
                        favorite.getId(),
                        favorite.getCity(),
                        favorite.getCountry()))
                .toList();
    }

    @Transactional
    public FavoriteResponse addFavorite(FavoriteRequest request) {
        User user = authService.currentUser();
        return favoriteRepository.findByUserAndCityIgnoreCase(user, request.city().trim())
                .map(favorite -> new FavoriteResponse(favorite.getId(), favorite.getCity(), favorite.getCountry()))
                .orElseGet(() -> {
                    Favorite favorite = new Favorite();
                    favorite.setUser(user);
                    favorite.setCity(request.city().trim());
                    favorite.setCountry(request.country() == null ? "" : request.country().trim());
                    Favorite saved = favoriteRepository.save(favorite);
                    return new FavoriteResponse(saved.getId(), saved.getCity(), saved.getCountry());
                });
    }

    @Transactional
    public void removeFavorite(String city) {
        User user = authService.currentUser();
        favoriteRepository.deleteByUserAndCityIgnoreCase(user, city.trim());
    }

    public record FavoriteRequest(String city, String country) {}

    public record FavoriteResponse(Long id, String city, String country) {}
}
