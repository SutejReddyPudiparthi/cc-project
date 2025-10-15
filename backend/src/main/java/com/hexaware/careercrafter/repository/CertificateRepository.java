package com.hexaware.careercrafter.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.hexaware.careercrafter.entities.Certificate;
import java.util.List;

@Repository
public interface CertificateRepository extends JpaRepository<Certificate, Integer> {
    List<Certificate> findByJobSeeker_JobSeekerId(int jobSeekerId);
}
