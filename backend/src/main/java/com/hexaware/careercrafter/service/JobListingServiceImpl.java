package com.hexaware.careercrafter.service;

import com.hexaware.careercrafter.dto.JobListingDTO;
import com.hexaware.careercrafter.dto.NotificationDTO;
import com.hexaware.careercrafter.entities.Employer;
import com.hexaware.careercrafter.entities.JobListing;
import com.hexaware.careercrafter.entities.JobSeeker;
import com.hexaware.careercrafter.exception.InvalidRequestException;
import com.hexaware.careercrafter.exception.ResourceNotFoundException;
import com.hexaware.careercrafter.repository.EmployerRepository;
import com.hexaware.careercrafter.repository.JobListingRepository;
import com.hexaware.careercrafter.repository.JobSeekerRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
import java.time.LocalDate;
import java.time.LocalDateTime;

/*
 * Implementation of IJobListingService.
 * Implements joblisting-related operations.
 */

@Service
public class JobListingServiceImpl implements IJobListingService {

    private static final Logger logger = LoggerFactory.getLogger(JobListingServiceImpl.class);

    @Autowired
    private JobListingRepository jobListingRepository;

    @Autowired
    private EmployerRepository employerRepository;

    @Autowired
    private JobSeekerRepository jobSeekerRepository;

    @Autowired
    private INotificationService notificationService;
    
    @Autowired
    private EmailService emailService;

    @Override
    public JobListingDTO createJobListing(JobListingDTO dto) {
        logger.debug("Creating job listing with employerId: {}, title: {}", dto.getEmployerId(), dto.getTitle());
        if (dto.getEmployerId() == 0 || dto.getTitle() == null || dto.getDescription() == null) {
            throw new InvalidRequestException("Employer, title, and description must be provided.");
        }
        if (dto.getPostedDate() != null && dto.getPostedDate().isAfter(LocalDate.now())) {
            throw new InvalidRequestException("Posted date cannot be in the future");
        }
        JobListing entity = mapToEntity(dto);

        if (entity.getPostedDate() == null) {
            entity.setPostedDate(LocalDate.now());
        }

        JobListing saved = jobListingRepository.save(entity);
        logger.info("Job listing created successfully with ID: {}", saved.getJobListingId());

        List<JobSeeker> matchedSeekers = jobSeekerRepository.findAll().stream()
            .filter(js -> true)
            .collect(Collectors.toList());

        matchedSeekers.forEach(seeker -> {
            try {
                notificationService.createNotification(new NotificationDTO(
                    Long.valueOf(seeker.getUser().getUserId()),
                    "New job posted: " + saved.getTitle(),
                    "A new job '" + saved.getTitle() + "' matching your profile is posted.",
                    false,
                    LocalDateTime.now(),
                    Long.valueOf(saved.getJobListingId()),
                    null
                ));

                emailService.sendEmail(
                    seeker.getUser().getEmail(),
                    "New Job Opportunity: " + saved.getTitle(),
                    "Hello " + seeker.getFullName() + ",\n\nA new job that matches your profile has been posted. Please check your dashboard."
                );
            } catch (Exception ex) {
                logger.error("Failed to notify seeker with ID {}: {}", seeker.getJobSeekerId(), ex.getMessage());
            }
        });

        return mapToDTO(saved);
    }

    @Override
    public JobListingDTO getJobListingById(int id) {
        JobListing jobListing = jobListingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job listing not found with ID: " + id));
        return mapToDTO(jobListing);
    }

    @Override
    public List<JobListingDTO> getAll() {
        return jobListingRepository.findAll()
                .stream().map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public JobListingDTO updateJobListing(JobListingDTO dto) {
        if (!jobListingRepository.existsById(dto.getJobListingId())) {
            throw new ResourceNotFoundException("Job listing not found with ID: " + dto.getJobListingId());
        }
        if (dto.getPostedDate() != null && dto.getPostedDate().isAfter(LocalDate.now())) {
            throw new InvalidRequestException("Posted date cannot be in the future");
        }
        JobListing entity = mapToEntity(dto);

        if (entity.getPostedDate() == null) {
            entity.setPostedDate(LocalDate.now());
        }

        JobListing saved = jobListingRepository.save(entity);
        return mapToDTO(saved);
    }

    @Override
    public void deleteJobListing(int id) {
        if (!jobListingRepository.existsById(id)) {
            throw new ResourceNotFoundException("Job listing not found with ID: " + id);
        }
        jobListingRepository.deleteById(id);
    }

    @Override
    public List<JobListingDTO> getActiveJobListings() {
        return jobListingRepository.findByActiveTrue()
                .stream().map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<JobListingDTO> getJobListingsByEmployerId(int employerId) {
        return jobListingRepository.findByEmployerEmployerId(employerId)
                .stream().map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<JobListingDTO> filterJobListings(String role, String skill, String location, Integer experience, String jobType) {
        JobListing.JobType jobTypeEnum = null;
        try {
            if (jobType != null && !jobType.isEmpty()) {
                jobTypeEnum = JobListing.JobType.valueOf(jobType.toUpperCase());
            }
        } catch (IllegalArgumentException e) {
            // ignore invalid jobType
        }

        List<JobListing> listings = jobListingRepository.filterJobListings(
            role != null && !role.isEmpty() ? role : null,
            skill != null && !skill.isEmpty() ? skill : null,
            location != null && !location.isEmpty() ? location : null,
            experience,
            jobTypeEnum
        );

        return listings.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private JobListingDTO mapToDTO(JobListing entity) {
        JobListingDTO dto = new JobListingDTO();
        dto.setJobListingId(entity.getJobListingId());
        dto.setEmployerId(entity.getEmployer() != null ? entity.getEmployer().getEmployerId() : 0);
        dto.setTitle(entity.getTitle());
        dto.setDescription(entity.getDescription());
        dto.setQualification(entity.getQualification());
        dto.setLocation(entity.getLocation());
        dto.setCompanyName(entity.getCompanyName());
        dto.setExperience(entity.getExperience());
        dto.setJobType(entity.getJobType());
        dto.setActive(entity.isActive());
        dto.setSalary(entity.getSalary());
        dto.setPostedDate(entity.getPostedDate());
        dto.setRequiredSkills(entity.getRequiredSkills());
        
        dto.setTotalApplicants(entity.getApplications() != null ? entity.getApplications().size() : 0);

        return dto;
    }

    private JobListing mapToEntity(JobListingDTO dto) {
        JobListing entity = new JobListing();
        entity.setJobListingId(dto.getJobListingId());
        Employer employer = employerRepository.findById(dto.getEmployerId())
                .orElseThrow(() -> new ResourceNotFoundException("Employer not found with ID: " + dto.getEmployerId()));
        entity.setEmployer(employer);
        entity.setTitle(dto.getTitle());
        entity.setDescription(dto.getDescription());
        entity.setQualification(dto.getQualification());
        entity.setCompanyName(dto.getCompanyName());
        entity.setExperience(dto.getExperience());
        entity.setLocation(dto.getLocation());
        entity.setJobType(dto.getJobType());
        entity.setActive(dto.isActive());
        entity.setSalary(dto.getSalary());
        entity.setPostedDate(dto.getPostedDate());
        entity.setRequiredSkills(dto.getRequiredSkills());
        return entity;
    }
}
