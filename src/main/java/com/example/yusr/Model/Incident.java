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
public class Incident {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotNull(message = "patient id cannot be null")
    @Positive(message = "patient id must be a positive number")
    @Column(columnDefinition = "int not null")
    private Integer patientId;

    @NotEmpty(message = "incident type cannot be empty")
    @Pattern(regexp = "^(fall|medication_error|health_change|injury|other)$", message = "incident type must be fall, medication_error, health_change, injury or other")
    @Column(columnDefinition = "varchar(16) not null")
    @Check(constraints = "incident_type IN ('fall','medication_error','health_change','injury','other')")
    private String incidentType;

    @NotEmpty(message = "description cannot be empty")
    @Size(min = 5, max = 500, message = "description must be between 5 and 500 characters")
    @Column(columnDefinition = "varchar(500) not null")
    private String description;

    @NotEmpty(message = "severity cannot be empty")
    @Pattern(regexp = "^(low|medium|high|critical)$", message = "severity must be low, medium, high or critical")
    @Column(columnDefinition = "varchar(8) not null")
    @Check(constraints = "severity IN ('low','medium','high','critical')")
    private String severity;

    @Size(max = 500, message = "action taken cannot exceed 500 characters")
    @Column(columnDefinition = "varchar(500)")
    private String actionTaken;

    @PastOrPresent(message = "incident time cannot be in the future")
    @Column(columnDefinition = "datetime not null")
    private LocalDateTime incidentAt;

    @Column(columnDefinition = "datetime not null")
    private LocalDateTime recordedAt;

    @Pattern(regexp = "^(open|monitoring|resolved)$", message = "status must be open, monitoring or resolved")
    @Column(columnDefinition = "varchar(10) not null")
    @Check(constraints = "status IN ('open','monitoring','resolved')")
    private String status;

    @Column(columnDefinition = "datetime")
    private LocalDateTime resolvedAt;
}
