package com.hexaware.careercrafter.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.hexaware.careercrafter.entities.Education;
import java.util.List;

@Repository
public interface EducationRepository extends JpaRepository<Education, Integer> {
	
    List<Education> findByJobSeeker_JobSeekerId(int jobSeekerId);
    
}
