package com.kush.birthday.controller;

import com.kush.birthday.model.Wish;
import com.kush.birthday.model.WishRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.concurrent.ConcurrentLinkedDeque;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/wishes")
public class WishController {

    private final ConcurrentLinkedDeque<Wish> wishes = new ConcurrentLinkedDeque<>();
    private final AtomicLong idSequence = new AtomicLong(1);

    public WishController() {
        wishes.addFirst(new Wish(idSequence.getAndIncrement(), "The Team",
                "Happy Birthday Kush! Hope it's a great one!", Instant.now()));
    }

    @GetMapping
    public List<Wish> listWishes() {
        return wishes.stream().collect(Collectors.toList());
    }

    @PostMapping
    public ResponseEntity<Wish> addWish(@RequestBody WishRequest request) {
        String name = sanitize(request.getName(), "Anonymous", 60);
        String message = sanitize(request.getMessage(), null, 280);

        if (message == null || message.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        Wish wish = new Wish(idSequence.getAndIncrement(), name, message, Instant.now());
        wishes.addFirst(wish);
        return ResponseEntity.status(HttpStatus.CREATED).body(wish);
    }

    private String sanitize(String input, String fallback, int maxLen) {
        if (input == null || input.trim().isEmpty()) {
            return fallback;
        }
        String trimmed = input.trim();
        return trimmed.length() > maxLen ? trimmed.substring(0, maxLen) : trimmed;
    }
}
