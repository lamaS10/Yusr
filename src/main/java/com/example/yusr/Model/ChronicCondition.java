package com.example.yusr.Model;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class ChronicCondition {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotNull(message = "patient id cannot be null")
    @Positive(message = "patient id must be a positive number")
    @Column(columnDefinition = "int not null")
    private Integer patientId;

    @NotEmpty(message = "condition name cannot be empty")
    @Size(min = 2, max = 50, message = "condition name must be between 2 and 50 characters")
    @Column(columnDefinition = "varchar(50) not null")
    private String conditionName;

    @PastOrPresent(message = "diagnosis date cannot be in the future")
    @Column(columnDefinition = "date")
    private LocalDate diagnosisDate;

    @Size(max = 500, message = "notes cannot exceed 500 characters")
    @Column(columnDefinition = "varchar(500)")
    private String notes;
}
