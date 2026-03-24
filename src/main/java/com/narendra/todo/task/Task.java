package com.narendra.todo.task;

public record Task(
    long id,
    String title,
    TaskStatus status,
    TaskPriority priority,
    long createdAtEpochMs
) {
}
