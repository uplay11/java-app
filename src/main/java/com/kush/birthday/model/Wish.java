package com.kush.birthday.model;

import java.time.Instant;

public class Wish {
    private final long id;
    private final String name;
    private final String message;
    private final Instant createdAt;

    public Wish(long id, String name, String message, Instant createdAt) {
        this.id = id;
        this.name = name;
        this.message = message;
        this.createdAt = createdAt;
    }

    public long getId() { return id; }
    public String getName() { return name; }
    public String getMessage() { return message; }
    public Instant getCreatedAt() { return createdAt; }
}
