package com.hexaware.careercrafter.repository;

import com.hexaware.careercrafter.entities.JobListing;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

@Repository
public interface JobListingRepository extends JpaRepository<JobListing, Integer>,  JpaSpecificationExecutor<JobListing> {

    List<JobListing> findByEmployerEmployerId(int employerId);
    List<JobListing> findByActiveTrue();

    @Query(value = """
    	    SELECT * FROM job_listings j
    	    WHERE j.active = true
    	      AND (
    	        LOWER(j.required_skills) REGEXP :skillsRegex
    	        OR LOWER(j.location) LIKE CONCAT('%', LOWER(:location), '%')
    	      )
    	""", nativeQuery = true)
    	List<JobListing> findRecommendedJobs(@Param("skillsRegex") String skillsRegex, @Param("location") String location);

    
    @Query("SELECT j FROM JobListing j WHERE " +
            "(:role IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :role, '%'))) AND " +
            "(:skill IS NULL OR LOWER(j.requiredSkills) LIKE LOWER(CONCAT('%', :skill, '%'))) AND " +
            "(:location IS NULL OR LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
            "(:experience IS NULL OR j.experience <= :experience) AND " +
            "(:jobType IS NULL OR j.jobType = :jobType) AND " +
            "(j.active = true)")
     List<JobListing> filterJobListings(
         @Param("role") String role,
         @Param("skill") String skill,
         @Param("location") String location,
         @Param("experience") Integer experience,
         @Param("jobType") JobListing.JobType jobType
     );


}
