package com.hexaware.careercrafter.service;

import com.hexaware.careercrafter.dto.EmployerDTO;
import com.hexaware.careercrafter.entities.Employer;
import com.hexaware.careercrafter.entities.User;
import com.hexaware.careercrafter.exception.InvalidRequestException;
import com.hexaware.careercrafter.exception.ResourceNotFoundException;
import com.hexaware.careercrafter.repository.EmployerRepository;
import com.hexaware.careercrafter.repository.UserRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Implementation of IEmployerService.
 * Handles employer-related operations such as creation, retrieval, update, and deletion.
 */
@Service
public class EmployerServiceImpl implements IEmployerService {

    private static final Logger logger = LoggerFactory.getLogger(EmployerServiceImpl.class);

    @Autowired
    private EmployerRepository employerRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Create a new Employer record.
     */
    @Override
    public EmployerDTO createEmployer(EmployerDTO employerDTO) {
        logger.debug("Creating employer for userId: {}, companyName: {}", employerDTO.getUserId(), employerDTO.getCompanyName());

        // ✅ Validate essential fields
        if (employerDTO.getUserId() == 0 || employerDTO.getCompanyName() == null) {
            throw new InvalidRequestException("UserId and Company Name must be provided.");
        }
        if (employerDTO.getPosition() == null || employerDTO.getPosition().trim().isEmpty()) {
            throw new InvalidRequestException("Position must be provided.");
        }
        if (employerDTO.getWorkEmail() == null || employerDTO.getWorkEmail().trim().isEmpty()) {
            throw new InvalidRequestException("Work email must be provided.");
        }

        // ✅ Verify that the user exists
        User user = userRepository.findById(employerDTO.getUserId())
                .orElseThrow(() -> new InvalidRequestException("Invalid UserId: " + employerDTO.getUserId()));

        // ✅ Convert DTO to Entity
        Employer employer = dtoToEntity(employerDTO);
        employer.setUser(user);

        Employer savedEmployer = employerRepository.save(employer);
        logger.info("Employer created successfully with ID: {}", savedEmployer.getEmployerId());

        return entityToDto(savedEmployer);
    }

    /**
     * Retrieve all employers.
     */
    @Override
    public List<EmployerDTO> getAllEmployers() {
        List<Employer> employers = employerRepository.findAll();
        List<EmployerDTO> dtoList = new ArrayList<>();

        for (Employer emp : employers) {
            dtoList.add(entityToDto(emp));
        }

        logger.info("Fetched {} employers", dtoList.size());
        return dtoList;
    }

    /**
     * Retrieve employer by employerId.
     */
    @Override
    public EmployerDTO getEmployerById(int id) {
        Employer employer = employerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employer not found with ID: " + id));
        return entityToDto(employer);
    }

    /**
     * Retrieve employer by userId.
     */
    @Override
    public EmployerDTO getEmployerByUserId(int userId) {
        logger.info("Fetching employer for userId: {}", userId);
        List<Employer> employers = employerRepository.findByUserUserId(userId);

        Employer employer = employers.stream()
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Employer not found for userId: " + userId));

        return entityToDto(employer);
    }

    /**
     * Delete employer by ID.
     */
    @Override
    public void deleteEmployer(int id) {
        if (!employerRepository.existsById(id)) {
            throw new ResourceNotFoundException("Employer does not exist with ID: " + id);
        }
        employerRepository.deleteById(id);
        logger.info("Employer deleted successfully with ID: {}", id);
    }

    /**
     * Update existing employer.
     */
    @Override
    public EmployerDTO updateEmployer(EmployerDTO employerDTO) {
        logger.debug("Updating employer with ID: {}", employerDTO.getEmployerId());

        if (!employerRepository.existsById(employerDTO.getEmployerId())) {
            throw new ResourceNotFoundException("Employer not found with ID: " + employerDTO.getEmployerId());
        }

        if (employerDTO.getWorkEmail() == null || employerDTO.getWorkEmail().trim().isEmpty()) {
            throw new InvalidRequestException("Work email must be provided.");
        }

        User user = userRepository.findById(employerDTO.getUserId())
                .orElseThrow(() -> new InvalidRequestException("Invalid UserId: " + employerDTO.getUserId()));

        Employer employer = dtoToEntity(employerDTO);
        employer.setUser(user);

        Employer updated = employerRepository.save(employer);
        logger.info("Employer updated successfully with ID: {}", updated.getEmployerId());
        return entityToDto(updated);
    }

    /**
     * Convert Entity → DTO
     */
    private EmployerDTO entityToDto(Employer employer) {
        EmployerDTO dto = new EmployerDTO();
        dto.setEmployerId(employer.getEmployerId());
        dto.setUserId(employer.getUser().getUserId());
        dto.setFullName(employer.getFullName());
        dto.setCompanyName(employer.getCompanyName());
        dto.setWorkEmail(employer.getWorkEmail());
        dto.setCompanyDescription(employer.getCompanyDescription());
        dto.setPosition(employer.getPosition());
        return dto;
    }

    /**
     * Convert DTO → Entity
     */
    private Employer dtoToEntity(EmployerDTO dto) {
        Employer employer = new Employer();
        employer.setEmployerId(dto.getEmployerId());
        employer.setFullName(dto.getFullName());
        employer.setCompanyName(dto.getCompanyName());
        employer.setWorkEmail(dto.getWorkEmail());
        employer.setCompanyDescription(dto.getCompanyDescription());
        employer.setPosition(dto.getPosition());
        return employer;
    }
}
