package com.hometutor.backend.repository;

import com.hometutor.backend.entity.Standard;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface StandardRepository extends JpaRepository<Standard, Long> {
    Optional<Standard> findByClassName(String className);
}
