package com.example.yusr.Model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Check;

import java.time.LocalDateTime;


@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class Caregiver {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Positive(message = "patient id must be a positive number")
    @Column(columnDefinition = "int")
    private Integer patientId;

    @NotEmpty(message = "full name cannot be empty")
    @Size(min = 3, max = 50, message = "full name must be between 3 and 50 characters")
    @Pattern(regexp = "^[\\p{L} ]+$", message = "full name must contain letters and spaces only")
    @Column(columnDefinition = "varchar(50) not null")
    private String fullName;

    @NotEmpty(message = "email cannot be empty")
    @Email(message = "email must be valid")
    @Column(columnDefinition = "varchar(100) not null unique")
    private String email;

    @NotEmpty(message = "password cannot be empty")
    @Size(min = 8, max = 30, message = "password must be between 8 and 30 characters")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]+$", message = "password must contain uppercase, lowercase, number and special character")
    @Column(columnDefinition = "varchar(30) not null")
    private String password;

    @NotEmpty(message = "phone number cannot be empty")
    @Pattern(regexp = "^05[0-9]{8}$", message = "phone number must start with 05 and contain 10 digits")
    @Column(columnDefinition = "varchar(10) not null unique")
    private String phoneNumber;

    @Pattern(regexp = "^(unassigned|primary|secondary|backup)$", message = "role must be unassigned, primary, secondary or backup")
    @Column(columnDefinition = "varchar(10)")
    @Check(constraints = "role IN ('primary','secondary','backup','unassigned')")
    private String role;

    @Column(columnDefinition = "datetime")
    private LocalDateTime assignedAt;

    @Pattern(regexp = "^(active|inactive)$", message = "status must be active or inactive")
    @Column(columnDefinition = "varchar(8) not null")
    @Check(constraints = "status IN ('active','inactive')")
    private String status;

    @Column(columnDefinition = "boolean not null")
    private Boolean isCurrentCaregiver;
}
