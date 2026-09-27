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
public class Handover {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotNull(message = "patient id cannot be null")
    @Positive(message = "patient id must be a positive number")
    @Column(columnDefinition = "int not null")
    private Integer patientId;

    @NotNull(message = "from caregiver id cannot be null")
    @Positive(message = "from caregiver id must be a positive number")
    @Column(columnDefinition = "int not null")
    private Integer fromCaregiverId;

    @NotNull(message = "to caregiver id cannot be null")
    @Positive(message = "to caregiver id must be a positive number")
    @Column(columnDefinition = "int not null")
    private Integer toCaregiverId;

    @NotEmpty(message = "summary cannot be empty")
    @Size(min = 5, max = 500, message = "summary must be between 5 and 500 characters")
    @Column(columnDefinition = "varchar(500) not null")
    private String summary;

    @Column(columnDefinition = "datetime not null")
    private LocalDateTime createdAt;

    @NotNull(message = "expected acceptance time cannot be null")
    @Column(columnDefinition = "datetime not null")
    private LocalDateTime expectedAcceptanceAt;

    @Column(columnDefinition = "datetime")
    private LocalDateTime acceptedAt;

    @Column(columnDefinition = "datetime")
    private LocalDateTime rejectedAt;

    @Pattern(regexp = "^(pending|accepted|rejected)$", message = "status must be pending, accepted or rejected")
    @Column(columnDefinition = "varchar(8) not null")
    @Check(constraints = "status IN ('pending','accepted','rejected')")
    private String status;

    @Column(columnDefinition = "boolean not null")
    private Boolean overdueAlertSent;
}
