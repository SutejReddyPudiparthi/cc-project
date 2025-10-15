package com.hexaware.careercrafter.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.hexaware.careercrafter.entities.SocialLink;
import java.util.List;

@Repository
public interface SocialLinkRepository extends JpaRepository<SocialLink, Integer> {
    List<SocialLink> findByJobSeeker_JobSeekerId(int jobSeekerId);
}
