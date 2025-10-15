package com.hexaware.careercrafter.service;

import com.hexaware.careercrafter.dto.*;
import com.hexaware.careercrafter.entities.*;
import com.hexaware.careercrafter.exception.InvalidRequestException;
import com.hexaware.careercrafter.exception.ResourceNotFoundException;
import com.hexaware.careercrafter.repository.JobListingRepository;
import com.hexaware.careercrafter.repository.JobSeekerRepository;
import com.hexaware.careercrafter.repository.UserRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/*
 * Implementation of IJobSeekerService.
 * Implements jobseeker-related operations.
 */

@Service
public class JobSeekerServiceImpl implements IJobSeekerService {
    private static final Logger logger = LoggerFactory.getLogger(JobSeekerServiceImpl.class);

    @Autowired
    private JobSeekerRepository jobSeekerRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JobListingRepository jobListingRepository;

    @Override
    public JobSeekerDTO createJobSeeker(JobSeekerDTO dto) {
        logger.debug("Attempting to create job seeker for userId: {}", dto.getUserId());
        if (dto.getFullName() == null || dto.getUserId() <= 0) {
            logger.error("Invalid request - missing required job seeker fields");
            throw new InvalidRequestException("Full name and valid userId are required.");
        }
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> {
                    logger.error("User not found with ID: {}", dto.getUserId());
                    return new ResourceNotFoundException("User not found with ID: " + dto.getUserId());
                });
        JobSeeker jobSeeker = convertToEntity(dto, user);
        JobSeeker saved = jobSeekerRepository.save(jobSeeker);
        logger.info("Job seeker created successfully with ID: {}", saved.getJobSeekerId());
        return convertToDTO(saved);
    }

    @Override
    public List<JobSeekerDTO> getAllJobSeekers() {
        logger.debug("Fetching all job seekers from database");
        return jobSeekerRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public JobSeekerDTO getJobSeekerById(int id) {
        logger.debug("Fetching job seeker with ID: {}", id);
        JobSeeker jobSeeker = jobSeekerRepository.findById(id)
                .orElseThrow(() -> {
                    logger.error("Job seeker not found with ID: {}", id);
                    return new ResourceNotFoundException("Job seeker not found with ID: " + id);
                });
        return convertToDTO(jobSeeker);
    }

    @Override
    public JobSeekerDTO getJobSeekerByUserId(int userId) {
        JobSeeker jobSeeker = jobSeekerRepository.findByUserUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("JobSeeker not found for userId: " + userId));
        return convertToDTO(jobSeeker);
    }

    @Override
    public JobSeekerDTO updateJobSeeker(JobSeekerDTO dto) {
        logger.debug("Updating job seeker with ID: {}", dto.getJobSeekerId());
        if (!jobSeekerRepository.existsById(dto.getJobSeekerId())) {
            logger.error("Cannot update - job seeker not found with ID: {}", dto.getJobSeekerId());
            throw new ResourceNotFoundException("Cannot update. JobSeeker not found with ID: " + dto.getJobSeekerId());
        }
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> {
                    logger.error("User not found with ID: {}", dto.getUserId());
                    return new ResourceNotFoundException("User not found with ID: " + dto.getUserId());
                });

        JobSeeker existingJobSeeker = jobSeekerRepository.findById(dto.getJobSeekerId())
                .orElseThrow(() -> new ResourceNotFoundException("JobSeeker not found with ID: " + dto.getJobSeekerId()));

        existingJobSeeker.setUser(user);
        existingJobSeeker.setFullName(dto.getFullName());
        existingJobSeeker.setPhone(dto.getPhone());
        existingJobSeeker.setAddress(dto.getAddress());
        existingJobSeeker.setSkills(dto.getSkills());
        existingJobSeeker.setExperience(dto.getExperience());
        existingJobSeeker.setEmail(dto.getEmail());
        existingJobSeeker.setGender(dto.getGender());
        existingJobSeeker.setDateOfBirth(dto.getDateOfBirth());
        existingJobSeeker.setAboutMe(dto.getAboutMe());

        if(existingJobSeeker.getEducationDetails() == null) existingJobSeeker.setEducationDetails(new ArrayList<>());
        existingJobSeeker.getEducationDetails().clear();
        existingJobSeeker.getEducationDetails().addAll(convertEducationDTOListToEntityList(dto.getEducationDetails(), existingJobSeeker));

        if(existingJobSeeker.getCertificates() == null) existingJobSeeker.setCertificates(new ArrayList<>());
        existingJobSeeker.getCertificates().clear();
        existingJobSeeker.getCertificates().addAll(convertCertificateDTOListToEntityList(dto.getCertificates(), existingJobSeeker));

        if(existingJobSeeker.getProjects() == null) existingJobSeeker.setProjects(new ArrayList<>());
        existingJobSeeker.getProjects().clear();
        existingJobSeeker.getProjects().addAll(convertProjectDTOListToEntityList(dto.getProjects(), existingJobSeeker));

        if(existingJobSeeker.getSocialLinks() == null) existingJobSeeker.setSocialLinks(new ArrayList<>());
        existingJobSeeker.getSocialLinks().clear();
        existingJobSeeker.getSocialLinks().addAll(convertSocialLinkDTOListToEntityList(dto.getSocialLinks(), existingJobSeeker));

        JobSeeker saved = jobSeekerRepository.save(existingJobSeeker);
        logger.info("Job seeker with ID {} updated successfully", saved.getJobSeekerId());
        return convertToDTO(saved);
    }

    @Override
    public void deleteJobSeeker(int id) {
        logger.debug("Deleting job seeker with ID: {}", id);
        if (!jobSeekerRepository.existsById(id)) {
            logger.error("Cannot delete - job seeker not found with ID: {}", id);
            throw new ResourceNotFoundException("Cannot delete. JobSeeker not found with ID: " + id);
        }
        jobSeekerRepository.deleteById(id);
        logger.info("Job seeker with ID {} deleted successfully", id);
    }

    @Override
    public List<JobListingDTO> getJobRecommendations(int jobSeekerId) {
        logger.debug("Fetching job recommendations for job seeker ID: {}", jobSeekerId);
        JobSeeker jobSeeker = jobSeekerRepository.findById(jobSeekerId)
                .orElseThrow(() -> new ResourceNotFoundException("JobSeeker not found with ID: " + jobSeekerId));

        if (jobSeeker.getSkills() == null || jobSeeker.getSkills().isEmpty()) {
            logger.info("Job seeker has no skills listed, returning empty recommendation list");
            return Collections.emptyList();
        }

        String[] seekerSkills = jobSeeker.getSkills().toLowerCase().split(",\\s*");
        String skillsRegex = String.join("|", seekerSkills);
        String location = jobSeeker.getAddress() != null ? jobSeeker.getAddress().toLowerCase() : "";
        List<JobListing> matchedJobs = jobListingRepository.findRecommendedJobs(skillsRegex, location);
        return matchedJobs.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    
    private JobListingDTO mapToDTO(JobListing jobListing) {
        JobListingDTO dto = new JobListingDTO();
        dto.setJobListingId(jobListing.getJobListingId());
        dto.setEmployerId(jobListing.getEmployer() != null ? jobListing.getEmployer().getEmployerId() : 0);
        dto.setTitle(jobListing.getTitle());
        dto.setDescription(jobListing.getDescription());
        dto.setQualification(jobListing.getQualification());
        dto.setLocation(jobListing.getLocation());
        dto.setCompanyName(jobListing.getCompanyName());
        dto.setExperience(jobListing.getExperience());
        dto.setJobType(jobListing.getJobType());
        dto.setActive(jobListing.isActive());
        dto.setSalary(jobListing.getSalary());
        dto.setPostedDate(jobListing.getPostedDate());
        dto.setRequiredSkills(jobListing.getRequiredSkills());
        return dto;
    }

    private JobSeeker convertToEntity(JobSeekerDTO dto, User user) {
        JobSeeker jobSeeker = new JobSeeker();
        jobSeeker.setJobSeekerId(dto.getJobSeekerId());
        jobSeeker.setUser(user);
        jobSeeker.setFullName(dto.getFullName());
        jobSeeker.setPhone(dto.getPhone());
        jobSeeker.setAddress(dto.getAddress());
        jobSeeker.setSkills(dto.getSkills());
        jobSeeker.setExperience(dto.getExperience());
        jobSeeker.setEmail(dto.getEmail());
        jobSeeker.setGender(dto.getGender());
        jobSeeker.setDateOfBirth(dto.getDateOfBirth());

        jobSeeker.setAboutMe(dto.getAboutMe());
        jobSeeker.setEducationDetails(convertEducationDTOListToEntityList(dto.getEducationDetails(), jobSeeker));
        jobSeeker.setCertificates(convertCertificateDTOListToEntityList(dto.getCertificates(), jobSeeker));
        jobSeeker.setProjects(convertProjectDTOListToEntityList(dto.getProjects(), jobSeeker));
        jobSeeker.setSocialLinks(convertSocialLinkDTOListToEntityList(dto.getSocialLinks(), jobSeeker));

        return jobSeeker;
    }

    private JobSeekerDTO convertToDTO(JobSeeker jobSeeker) {
        JobSeekerDTO dto = new JobSeekerDTO();
        dto.setJobSeekerId(jobSeeker.getJobSeekerId());
        dto.setUserId(jobSeeker.getUser().getUserId());
        dto.setFullName(jobSeeker.getFullName());
        dto.setPhone(jobSeeker.getPhone());
        dto.setAddress(jobSeeker.getAddress());
        dto.setSkills(jobSeeker.getSkills());
        dto.setExperience(jobSeeker.getExperience());
        dto.setEmail(jobSeeker.getEmail());
        dto.setGender(jobSeeker.getGender());
        dto.setDateOfBirth(jobSeeker.getDateOfBirth());

        dto.setAboutMe(jobSeeker.getAboutMe());
        dto.setEducationDetails(convertEducationEntityListToDTOList(jobSeeker.getEducationDetails()));
        dto.setCertificates(convertCertificateEntityListToDTOList(jobSeeker.getCertificates()));
        dto.setProjects(convertProjectEntityListToDTOList(jobSeeker.getProjects()));
        dto.setSocialLinks(convertSocialLinkEntityListToDTOList(jobSeeker.getSocialLinks()));

        return dto;
    }

    private EducationDTO convertToEducationDTO(Education entity) {
        EducationDTO dto = new EducationDTO();
        dto.setId(entity.getId());
        dto.setLevel(entity.getLevel());
        dto.setInstitutionName(entity.getInstitutionName());
        dto.setStream(entity.getStream());
        dto.setStartYear(entity.getStartYear());
        dto.setEndYear(entity.getEndYear());
        dto.setLocation(entity.getLocation());
        return dto;
    }

    private Education convertToEducationEntity(EducationDTO dto, JobSeeker jobSeeker) {
        Education entity = new Education();
        entity.setId(dto.getId());
        entity.setLevel(dto.getLevel());
        entity.setInstitutionName(dto.getInstitutionName());
        entity.setStream(dto.getStream());
        entity.setStartYear(dto.getStartYear());
        entity.setEndYear(dto.getEndYear());
        entity.setLocation(dto.getLocation());
        entity.setJobSeeker(jobSeeker);
        return entity;
    }

    private List<EducationDTO> convertEducationEntityListToDTOList(List<Education> entities) {
        return entities == null ? null : entities.stream()
            .map(this::convertToEducationDTO)
            .collect(Collectors.toList());
    }

    private List<Education> convertEducationDTOListToEntityList(List<EducationDTO> dtos, JobSeeker jobSeeker) {
        return dtos == null ? null : dtos.stream()
            .map(dto -> convertToEducationEntity(dto, jobSeeker))
            .collect(Collectors.toList());
    }

    private CertificateDTO convertToCertificateDTO(Certificate entity) {
        CertificateDTO dto = new CertificateDTO();
        dto.setId(entity.getId());
        dto.setCertificateName(entity.getCertificateName());
        dto.setOrganization(entity.getOrganization());
        dto.setStartDate(entity.getStartDate());
        dto.setEndDate(entity.getEndDate());
        return dto;
    }

    private Certificate convertToCertificateEntity(CertificateDTO dto, JobSeeker jobSeeker) {
        Certificate entity = new Certificate();
        entity.setId(dto.getId());
        entity.setCertificateName(dto.getCertificateName());
        entity.setOrganization(dto.getOrganization());
        entity.setStartDate(dto.getStartDate());
        entity.setEndDate(dto.getEndDate());
        entity.setJobSeeker(jobSeeker);
        return entity;
    }

    private List<CertificateDTO> convertCertificateEntityListToDTOList(List<Certificate> entities) {
        return entities == null ? null : entities.stream()
            .map(this::convertToCertificateDTO)
            .collect(Collectors.toList());
    }

    private List<Certificate> convertCertificateDTOListToEntityList(List<CertificateDTO> dtos, JobSeeker jobSeeker) {
        return dtos == null ? null : dtos.stream()
            .map(dto -> convertToCertificateEntity(dto, jobSeeker))
            .collect(Collectors.toList());
    }

    private ProjectDTO convertToProjectDTO(Project entity) {
        ProjectDTO dto = new ProjectDTO();
        dto.setId(entity.getId());
        dto.setProjectName(entity.getProjectName());
        dto.setDescription(entity.getDescription());
        dto.setLink(entity.getLink());
        return dto;
    }

    private Project convertToProjectEntity(ProjectDTO dto, JobSeeker jobSeeker) {
        Project entity = new Project();
        entity.setId(dto.getId());
        entity.setProjectName(dto.getProjectName());
        entity.setDescription(dto.getDescription());
        entity.setLink(dto.getLink());
        entity.setJobSeeker(jobSeeker);
        return entity;
    }

    private List<ProjectDTO> convertProjectEntityListToDTOList(List<Project> entities) {
        return entities == null ? null : entities.stream()
            .map(this::convertToProjectDTO)
            .collect(Collectors.toList());
    }

    private List<Project> convertProjectDTOListToEntityList(List<ProjectDTO> dtos, JobSeeker jobSeeker) {
        return dtos == null ? null : dtos.stream()
            .map(dto -> convertToProjectEntity(dto, jobSeeker))
            .collect(Collectors.toList());
    }

    private SocialLinkDTO convertToSocialLinkDTO(SocialLink entity) {
        SocialLinkDTO dto = new SocialLinkDTO();
        dto.setId(entity.getId());
        dto.setPlatform(entity.getPlatform());
        dto.setUrl(entity.getUrl());
        return dto;
    }

    private SocialLink convertToSocialLinkEntity(SocialLinkDTO dto, JobSeeker jobSeeker) {
        SocialLink entity = new SocialLink();
        entity.setId(dto.getId());
        entity.setPlatform(dto.getPlatform());
        entity.setUrl(dto.getUrl());
        entity.setJobSeeker(jobSeeker);
        return entity;
    }

    private List<SocialLinkDTO> convertSocialLinkEntityListToDTOList(List<SocialLink> entities) {
        return entities == null ? null : entities.stream()
            .map(this::convertToSocialLinkDTO)
            .collect(Collectors.toList());
    }

    private List<SocialLink> convertSocialLinkDTOListToEntityList(List<SocialLinkDTO> dtos, JobSeeker jobSeeker) {
        return dtos == null ? null : dtos.stream()
            .map(dto -> convertToSocialLinkEntity(dto, jobSeeker))
            .collect(Collectors.toList());
    }
}
