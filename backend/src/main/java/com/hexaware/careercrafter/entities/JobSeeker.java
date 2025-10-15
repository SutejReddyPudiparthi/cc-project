package com.hexaware.careercrafter.entities;

import jakarta.persistence.*;

import java.util.List;
import java.time.LocalDate;

/*
 * This entity represents a JobSeeker
 * Contains personal details of a JobSeeker and it is linked with User entity 
 * It is connected with resumes and applications
 * 
 */

@Entity
@Table(name = "job_seekers")
public class JobSeeker {

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private int jobSeekerId;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false)
    private String fullName;
    
    private String gender;
    private LocalDate dateOfBirth;
    
    @Column(nullable = false)
    private String email;
    private String phone;
    private String address;

    // Remove this field as it is replaced by educationDetails list
    // private String education;

    private String skills;
    private Integer experience;

    @Column(columnDefinition = "TEXT")
    private String aboutMe;

    @OneToMany(mappedBy = "jobSeeker", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Education> educationDetails;

    @OneToMany(mappedBy = "jobSeeker", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Certificate> certificates;

    @OneToMany(mappedBy = "jobSeeker", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Project> projects;

    @OneToMany(mappedBy = "jobSeeker", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SocialLink> socialLinks;

    @OneToMany(mappedBy = "jobSeeker", cascade = CascadeType.ALL)
    private List<Resume> resumes;

    @OneToMany(mappedBy = "jobSeeker", cascade = CascadeType.ALL)
    private List<Application> applications;

    public JobSeeker() {
    
    }

    public JobSeeker(int jobSeekerId, User user, String fullName, String phone, String address, String email, String gender, LocalDate dateOfBirth,
        // Removed education from constructor arguments
        String skills, Integer experience, List<Resume> resumes, List<Application> applications,
        String aboutMe, List<Education> educationDetails, List<Certificate> certificates,
        List<Project> projects, List<SocialLink> socialLinks) {
        super();
        this.jobSeekerId = jobSeekerId;
        this.user = user;
        this.fullName = fullName;
        this.email = email;
        this.gender = gender;
        this.dateOfBirth = dateOfBirth;
        this.phone = phone;
        this.address = address;
        this.skills = skills;
        this.experience = experience;
        this.resumes = resumes;
        this.applications = applications;
        this.aboutMe = aboutMe;
        this.educationDetails = educationDetails;
        this.certificates = certificates;
        this.projects = projects;
        this.socialLinks = socialLinks;
    }

    public int getJobSeekerId() {
        return jobSeekerId;
    }

    public void setJobSeekerId(int jobSeekerId) {
        this.jobSeekerId = jobSeekerId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    /* Removed getter/setter for education string field */

    public String getSkills() {
        return skills;
    }

    public void setSkills(String skills) {
        this.skills = skills;
    }

    public Integer getExperience() {
        return experience;
    }

    public void setExperience(Integer experience) {
        this.experience = experience;
    }

    public List<Resume> getResumes() {
        return resumes;
    }

    public void setResumes(List<Resume> resumes) {
        this.resumes = resumes;
    }

    public List<Application> getApplications() {
        return applications;
    }

    public void setApplications(List<Application> applications) {
        this.applications = applications;
    }

    public String getAboutMe() {
        return aboutMe;
    }

    public void setAboutMe(String aboutMe) {
        this.aboutMe = aboutMe;
    }

    public List<Education> getEducationDetails() {
        return educationDetails;
    }

    public void setEducationDetails(List<Education> educationDetails) {
        this.educationDetails = educationDetails;
    }

    public List<Certificate> getCertificates() {
        return certificates;
    }

    public void setCertificates(List<Certificate> certificates) {
        this.certificates = certificates;
    }

    public List<Project> getProjects() {
        return projects;
    }

    public void setProjects(List<Project> projects) {
        this.projects = projects;
    }

    public List<SocialLink> getSocialLinks() {
        return socialLinks;
    }

    public void setSocialLinks(List<SocialLink> socialLinks) {
        this.socialLinks = socialLinks;
    }
    
}
