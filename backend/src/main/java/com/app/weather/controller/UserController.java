package com.app.weather.controller;

import com.app.weather.service.UserService;
import com.app.weather.service.UserService.FavoriteRequest;
import com.app.weather.service.UserService.FavoriteResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/favorites")
    public ResponseEntity<List<FavoriteResponse>> favorites() {
        return ResponseEntity.ok(userService.favorites());
    }

    @PostMapping("/favorites")
    public ResponseEntity<FavoriteResponse> addFavorite(@Valid @RequestBody FavoritePayload payload) {
        FavoriteResponse favorite = userService.addFavorite(new FavoriteRequest(payload.city(), payload.country()));
        return ResponseEntity.status(HttpStatus.CREATED).body(favorite);
    }

    @DeleteMapping("/favorites/{city}")
    public ResponseEntity<Void> removeFavorite(@PathVariable String city) {
        userService.removeFavorite(city);
        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleError(RuntimeException ex) {
        return ResponseEntity.badRequest().body(new ErrorResponse(ex.getMessage()));
    }

    public record FavoritePayload(
            @NotBlank(message = "City is required")
            String city,
            String country) {}

    public record ErrorResponse(String error) {}
}
