package com.narendra.todo.task;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class TaskService {

    private final Map<Long, Task> tasks = new ConcurrentHashMap<>();
    private final AtomicLong idSequence = new AtomicLong(1);

    public List<Task> listTasks() {
        return tasks.values().stream()
            .sorted(Comparator.comparingLong(Task::id).reversed())
            .toList();
    }

    public Task createTask(CreateTaskRequest request) {
        long id = idSequence.getAndIncrement();
        Task task = new Task(
            id,
            request.title().trim(),
            request.status(),
            request.priority(),
            Instant.now().toEpochMilli()
        );
        tasks.put(id, task);
        return task;
    }

    public Task updateTask(long id, UpdateTaskRequest request) {
        Task existing = tasks.get(id);
        if (existing == null) {
            throw new TaskNotFoundException(id);
        }

        Task updated = new Task(
            existing.id(),
            request.title().trim(),
            request.status(),
            request.priority(),
            existing.createdAtEpochMs()
        );
        tasks.put(id, updated);
        return updated;
    }

    public void deleteTask(long id) {
        Task removed = tasks.remove(id);
        if (removed == null) {
            throw new TaskNotFoundException(id);
        }
    }
}
