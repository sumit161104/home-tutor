package com.hometutor.backend.controller;

import com.hometutor.backend.entity.Subject;
import com.hometutor.backend.repository.SubjectRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/subjects")
public class SubjectController {

    private final SubjectRepository subjectRepository;

    public SubjectController(SubjectRepository subjectRepository) {
        this.subjectRepository = subjectRepository;
    }

    @GetMapping
    public ResponseEntity<List<Subject>> getAllSubjects() {
        return ResponseEntity.ok(subjectRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> createSubject(@RequestBody Subject subject) {
        if (subject.getName() == null || subject.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Subject name cannot be empty"));
        }
        
        if (subjectRepository.findByName(subject.getName().trim()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Subject already exists"));
        }

        subject.setName(subject.getName().trim());
        Subject savedSubject = subjectRepository.save(subject);
        return ResponseEntity.ok(savedSubject);
    }
}
