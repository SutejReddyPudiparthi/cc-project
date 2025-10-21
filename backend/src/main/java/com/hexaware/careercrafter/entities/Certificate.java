package com.hexaware.careercrafter.entities;

import jakarta.persistence.*;
import java.time.YearMonth;


@Entity
@Table(name = "certificates")
public class Certificate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne
    @JoinColumn(name = "job_seeker_id", nullable = false)
    private JobSeeker jobSeeker;

    @Column(nullable = false)
    private String certificateName;

    @Column(nullable = false)
    private String organization;

    private YearMonth startDate;

    private YearMonth endDate;
    
    public Certificate() {
    	
    }

	public Certificate(int id, JobSeeker jobSeeker, String certificateName, String organization, YearMonth startDate,
			YearMonth endDate) {
		super();
		this.id = id;
		this.jobSeeker = jobSeeker;
		this.certificateName = certificateName;
		this.organization = organization;
		this.startDate = startDate;
		this.endDate = endDate;
	}

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public JobSeeker getJobSeeker() {
		return jobSeeker;
	}

	public void setJobSeeker(JobSeeker jobSeeker) {
		this.jobSeeker = jobSeeker;
	}

	public String getCertificateName() {
		return certificateName;
	}

	public void setCertificateName(String certificateName) {
		this.certificateName = certificateName;
	}

	public String getOrganization() {
		return organization;
	}

	public void setOrganization(String organization) {
		this.organization = organization;
	}

	public YearMonth getStartDate() {
		return startDate;
	}

	public void setStartDate(YearMonth startDate) {
		this.startDate = startDate;
	}

	public YearMonth getEndDate() {
		return endDate;
	}

	public void setEndDate(YearMonth endDate) {
		this.endDate = endDate;
	}
    
    
}
