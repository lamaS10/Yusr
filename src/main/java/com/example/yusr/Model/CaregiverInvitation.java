package com.example.yusr.Model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Check;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class CaregiverInvitation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotNull(message = "patient id cannot be null")
    @Positive(message = "patient id must be a positive number")
    @Column(columnDefinition = "int not null")
    private Integer patientId;

    @NotEmpty(message = "email cannot be empty")
    @Email(message = "email must be valid")
    @Column(columnDefinition = "varchar(100) not null")
    private String email;

    @NotEmpty(message = "phone number cannot be empty")
    @Pattern(
            regexp = "^05[0-9]{8}$",
            message = "phone number must start with 05 and contain 10 digits"
    )
    @Column(columnDefinition = "varchar(10) not null")
    private String phoneNumber;

    @Pattern(
            regexp = "^(secondary|backup)$",
            message = "role must be secondary or backup"
    )
    @Column(columnDefinition = "varchar(10) not null")
    @Check(constraints = "role IN ('secondary','backup')")
    private String role;

    @Pattern(
            regexp = "^(pending|accepted|rejected)$",
            message = "status must be pending, accepted or rejected"
    )
    @Column(columnDefinition = "varchar(8) not null")
    @Check(constraints = "status IN ('pending','accepted','rejected')")
    private String status;

    @Column(columnDefinition = "datetime not null")
    private LocalDateTime createdAt;
}