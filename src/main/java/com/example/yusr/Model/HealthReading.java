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
public class HealthReading {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotNull(message = "patient id cannot be null")
    @Positive(message = "patient id must be a positive number")
    @Column(columnDefinition = "int not null")
    private Integer patientId;

    @NotEmpty(message = "reading type cannot be empty")
    @Pattern(regexp = "^(blood_pressure|glucose|temperature|weight|heart_rate)$", message = "invalid reading type")
    @Column(columnDefinition = "varchar(14) not null")
    @Check(constraints = "reading_type IN ('blood_pressure','glucose','temperature','weight','heart_rate')")
    private String readingType;

    @Positive(message = "reading value must be positive")
    @Column(columnDefinition = "double")
    private Double readingValue;

    @Positive(message = "systolic value must be positive")
    @Column(columnDefinition = "double")
    private Double systolicValue;

    @Positive(message = "diastolic value must be positive")
    @Column(columnDefinition = "double")
    private Double diastolicValue;

    @Column(columnDefinition = "varchar(10) not null")
    private String unit;

    @Column(columnDefinition = "datetime not null")
    private LocalDateTime recordedAt;

    @PastOrPresent(message = "measured time cannot be in the future")
    @Column(columnDefinition = "datetime not null")
    private LocalDateTime measuredAt;

    @Size(max = 255, message = "notes cannot exceed 255 characters")
    @Column(columnDefinition = "varchar(255)")
    private String notes;

    @Pattern(
            regexp = "^(normal|elevated|low|high|critical|not_classified)$",
            message = "invalid reading status"
    )
    @Check(constraints = "reading_status IN ('normal','elevated','low','high','critical','not_classified')")
    @Column(columnDefinition = "varchar(14) not null")
    private String readingStatus;

    @Pattern(
            regexp = "^(fasting|after_meal)$",
            message = "invalid glucose measurement type"
    )
    @Check(constraints = "glucose_measurement_type IN ('fasting','after_meal')")
    @Column(columnDefinition = "varchar(10)")
    private String glucoseMeasurementType;
}
