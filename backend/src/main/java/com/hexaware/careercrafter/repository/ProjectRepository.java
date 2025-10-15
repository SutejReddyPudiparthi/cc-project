package com.hexaware.careercrafter.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.hexaware.careercrafter.entities.Project;
import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Integer> {
    List<Project> findByJobSeeker_JobSeekerId(int jobSeekerId);
}
