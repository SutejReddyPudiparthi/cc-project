package com.hexaware.careercrafter.service;

import com.hexaware.careercrafter.dto.ApplicationDTO;
import com.hexaware.careercrafter.dto.ApplicationDTO.ApplicationStatus;
import com.hexaware.careercrafter.dto.NotificationDTO;
import com.hexaware.careercrafter.entities.Application;
import com.hexaware.careercrafter.entities.JobListing;
import com.hexaware.careercrafter.entities.JobSeeker;
import com.hexaware.careercrafter.exception.InvalidRequestException;
import com.hexaware.careercrafter.exception.ResourceNotFoundException;
import com.hexaware.careercrafter.repository.ApplicationRepository;
import com.hexaware.careercrafter.repository.JobListingRepository;
import com.hexaware.careercrafter.repository.JobSeekerRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ApplicationServiceImpl implements IApplicationService {
    private static final Logger logger = LoggerFactory.getLogger(ApplicationServiceImpl.class);

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private JobListingRepository jobListingRepository;

    @Autowired
    private JobSeekerRepository jobSeekerRepository;

    @Autowired
    private INotificationService notificationService;

    @Autowired
    private EmailService emailService;

    @Override
    @Transactional
    public ApplicationDTO applyForJob(ApplicationDTO dto) {
        logger.debug("Applying for job ID {} by job seeker ID {}", dto.getJobListingId(), dto.getJobSeekerId());

        if (dto.getJobListingId() == 0 || dto.getJobSeekerId() == 0) {
            logger.error("Missing jobListingId or jobSeekerId");
            throw new InvalidRequestException("jobListingId and jobSeekerId are required");
        }

        JobListing jobListing = jobListingRepository.findById(dto.getJobListingId())
                .orElseThrow(() -> new ResourceNotFoundException("Job listing not found with ID " + dto.getJobListingId()));

        JobSeeker jobSeeker = jobSeekerRepository.findById(dto.getJobSeekerId())
                .orElseThrow(() -> new ResourceNotFoundException("Job seeker not found with ID " + dto.getJobSeekerId()));

        Application entity = new Application();
        entity.setJobListing(jobListing);
        entity.setJobSeeker(jobSeeker);
        entity.setStatus(Application.ApplicationStatus.valueOf(dto.getStatus().name()));
        entity.setResumeFilePath(dto.getResumeFilePath());
        entity.setJobTitle(jobListing.getTitle());
        entity.setApplicantName(jobSeeker.getFullName());
        
        Application saved = applicationRepository.save(entity);
        logger.info("Application created with ID {}", saved.getApplicationId());

        // Safe notification & email sending to Employer
        try {
            if (jobListing.getEmployer() != null && jobListing.getEmployer().getUser() != null) {
                Long employerUserId = Long.valueOf(jobListing.getEmployer().getUser().getUserId());

                NotificationDTO notification = new NotificationDTO(
                        employerUserId,
                        "New Application Received",
                        jobSeeker.getFullName() + " has applied for your job: " + jobListing.getTitle(),
                        false,
                        LocalDateTime.now(),
                        Long.valueOf(jobListing.getJobListingId()),
                        Long.valueOf(saved.getApplicationId())
                );
                notificationService.createNotification(notification);

                emailService.sendEmail(
                        jobListing.getEmployer().getUser().getEmail(),
                        "New Application Received",
                        "Hello " + jobListing.getEmployer().getFullName() +
                                ",\n\n" + jobSeeker.getFullName() + " applied for your job '" + jobListing.getTitle() + "'. Please review it on your dashboard."
                );
            } else {
                logger.warn("Cannot send notification/email: Employer or User is null for jobListingId {}", jobListing.getJobListingId());
            }
        } catch (Exception e) {
            logger.error("Failed to send notification/email for jobListingId {}", jobListing.getJobListingId(), e);
        }

        return mapToDto(saved);
    }

    @Override
    public ApplicationDTO getApplicationById(int id) {
        Application entity = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with ID " + id));
        return mapToDto(entity);
    }

    @Override
    public List<ApplicationDTO> getAllApplications() {
        List<Application> entities = applicationRepository.findAll();
        return entities.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ApplicationDTO> getApplicationsByJobSeekerId(int jobSeekerId) {
        List<Application> entities = applicationRepository.findByJobSeekerJobSeekerId(jobSeekerId);
        return entities.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ApplicationDTO updateApplication(ApplicationDTO dto) {
        if (!applicationRepository.existsById(dto.getApplicationId())) {
            throw new ResourceNotFoundException("Application not found with ID " + dto.getApplicationId());
        }

        JobListing jobListing = jobListingRepository.findById(dto.getJobListingId())
                .orElseThrow(() -> new ResourceNotFoundException("Job listing not found with ID " + dto.getJobListingId()));

        JobSeeker jobSeeker = jobSeekerRepository.findById(dto.getJobSeekerId())
                .orElseThrow(() -> new ResourceNotFoundException("Job seeker not found with ID " + dto.getJobSeekerId()));

        Application entity = new Application();
        entity.setApplicationId(dto.getApplicationId());
        entity.setJobListing(jobListing);
        entity.setJobSeeker(jobSeeker);
        entity.setStatus(Application.ApplicationStatus.valueOf(dto.getStatus().name()));
        entity.setResumeFilePath(dto.getResumeFilePath());

        Application updated = applicationRepository.save(entity);
        logger.info("Application updated with ID {}", updated.getApplicationId());

        // Safe notification & email sending to JobSeeker
        try {
            if (jobSeeker.getUser() != null) {
                Long jobSeekerUserId = Long.valueOf(jobSeeker.getUser().getUserId());

                NotificationDTO notification = new NotificationDTO(
                        jobSeekerUserId,
                        "Application Status Updated",
                        "Your application for '" + jobListing.getTitle() + "' has been updated to " + dto.getStatus(),
                        false,
                        LocalDateTime.now(),
                        Long.valueOf(jobListing.getJobListingId()),
                        Long.valueOf(updated.getApplicationId())
                );
                notificationService.createNotification(notification);

                emailService.sendEmail(
                        jobSeeker.getEmail(),
                        "Application Status Updated",
                        "Hello " + jobSeeker.getFullName() +
                                ",\n\nYour application for '" + jobListing.getTitle() + "' status changed to " + dto.getStatus() + "."
                );
            } else {
                logger.warn("Cannot send notification/email: JobSeeker User is null for applicationId {}", dto.getApplicationId());
            }
        } catch (Exception e) {
            logger.error("Failed to send notification/email for applicationId {}", dto.getApplicationId(), e);
        }

        return mapToDto(updated);
    }

    @Override
    @Transactional
    public void deleteApplication(int id) {
        if (!applicationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Application not found with ID " + id);
        }
        applicationRepository.deleteById(id);
        logger.info("Application deleted with ID {}", id);
    }

    private ApplicationDTO mapToDto(Application entity) {
        ApplicationDTO dto = new ApplicationDTO();
        dto.setApplicationId(entity.getApplicationId());
        dto.setJobListingId(entity.getJobListing().getJobListingId());
        dto.setJobSeekerId(entity.getJobSeeker().getJobSeekerId());
        dto.setStatus(ApplicationStatus.valueOf(entity.getStatus().name()));
        dto.setResumeFilePath(entity.getResumeFilePath());
        dto.setJobTitle(entity.getJobTitle());
        dto.setApplicantName(entity.getApplicantName());
        dto.setApplicationDate(entity.getApplicationDate());
        return dto;
    }
}
