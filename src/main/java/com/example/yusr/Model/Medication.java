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
public class Medication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotNull(message = "patient id cannot be null")
    @Positive(message = "patient id must be a positive number")
    @Column(columnDefinition = "int not null")
    private Integer patientId;

    @NotEmpty(message = "medication name cannot be empty")
    @Size(min = 2, max = 50, message = "medication name must be between 2 and 50 characters")
    @Column(columnDefinition = "varchar(50) not null")
    private String name;

    @NotNull(message = "dosage value cannot be null")
    @Positive(message = "dosage value must be greater than zero")
    @Column(columnDefinition = "double not null")
    private Double dosageValue;

    @NotEmpty(message = "dosage unit cannot be empty")
    @Pattern(regexp = "^(mg|g|mcg|ml|tablet|capsule)$", message = "dosage unit must be mg, g, mcg, ml, tablet or capsule")
    @Column(columnDefinition = "varchar(10) not null")
    @Check(constraints = "dosage_unit IN ('mg','g','mcg','ml','tablet','capsule')")
    private String dosageUnit;

    @NotNull(message = "stock quantity cannot be null")
    @PositiveOrZero(message = "stock quantity cannot be negative")
    @Column(columnDefinition = "int not null")
    private Integer stockQuantity;

    @NotNull(message = "low stock limit cannot be null")
    @PositiveOrZero(message = "low stock limit cannot be negative")
    @Column(columnDefinition = "int not null")
    private Integer lowStockLimit;

    @NotNull(message = "start date cannot be null")
    @Column(columnDefinition = "date not null")
    private LocalDate startDate;

    @Column(columnDefinition = "date")
    private LocalDate endDate;

    @Pattern(regexp = "^(active|completed|discontinued)$", message = "status must be active, completed or discontinued")
    @Column(columnDefinition = "varchar(12) not null")
    @Check(constraints = "status IN ('active','completed','discontinued')")
    private String status;
}
