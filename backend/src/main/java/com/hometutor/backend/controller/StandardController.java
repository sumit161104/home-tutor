package com.hometutor.backend.controller;

import com.hometutor.backend.entity.Standard;
import com.hometutor.backend.repository.StandardRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/standards")
public class StandardController {

    private final StandardRepository standardRepository;

    public StandardController(StandardRepository standardRepository) {
        this.standardRepository = standardRepository;
    }

    @GetMapping
    public ResponseEntity<List<Standard>> getAllStandards() {
        return ResponseEntity.ok(standardRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> createStandard(@RequestBody Standard standard) {
        if (standard.getClassName() == null || standard.getClassName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Class name cannot be empty"));
        }

        if (standardRepository.findByClassName(standard.getClassName().trim()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Standard already exists"));
        }

        standard.setClassName(standard.getClassName().trim());
        Standard savedStandard = standardRepository.save(standard);
        return ResponseEntity.ok(savedStandard);
    }
}
