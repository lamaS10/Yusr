package com.example.yusr.Model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Check;

import java.time.LocalDate;


@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(columnDefinition = "varchar(20) not null unique")
    private String patientCode;


    @NotEmpty(message = "full name cannot be empty")
    @Size(min = 3, max = 50, message = "fullName must be between 3 and 50 characters")
    @Pattern(regexp = "^[\\p{L} ]+$", message = "full name must contain letters and spaces only")
    @Column(columnDefinition = "varchar(50) not null")
    private String fullName;

    @NotNull(message = "date of birth cannot be null")
    @Past(message = "date of birth must be in the past")
    @Column(columnDefinition = "date not null")
    private LocalDate dateOfBirth;

    @NotEmpty(message = "gender cannot be empty")
    @Pattern(regexp = "^(male|female)$", message = "gender must be male or female")
    @Column(columnDefinition = "varchar(6) not null")
    @Check(constraints = "gender IN ('male','female')")
    private String gender;

    @NotEmpty(message = "emergency contact name cannot be empty")
    @Size(min = 3, max = 50, message = "emergency contact name must be between 3 and 50 characters")
    @Pattern(regexp = "^[\\p{L} ]+$", message = "emergency contact name must contain letters and spaces only")
    @Column(columnDefinition = "varchar(50) not null")
    private String emergencyContactName;


    @NotEmpty(message = "emergency contact phone cannot be empty")
    @Pattern(regexp = "^05[0-9]{8}$", message = "phone number must start with 05 and contain 10 digits")
    @Column(columnDefinition = "varchar(10) not null")
    private String emergencyContactPhone;


    @NotEmpty(message = "blood type cannot be empty")
    @Pattern(regexp = "^(A|B|AB|O)[+-]$", message = "invalid blood type")
    @Column(columnDefinition = "varchar(3) not null")
    @Check(constraints = "blood_type IN ('A+','A-','B+','B-','AB+','AB-','O+','O-')")
    private String bloodType;


    @Size(max = 255, message = "allergies cannot exceed 255 characters")
    @Column(columnDefinition = "varchar(255)")
    private String allergies;


    @Size(max = 500, message = "medical notes cannot exceed 500 characters")
    @Column(columnDefinition = "varchar(500)")
    private String medicalNotes;


    @Pattern(regexp = "^(active|inactive)$", message = "status must be active or inactive")
    @Column(columnDefinition = "varchar(8) not null")
    @Check(constraints = "status IN ('active','inactive')")
    private String status;
}
