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
public class CareTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotNull(message = "patient id cannot be null")
    @Positive(message = "patient id must be a positive number")
    @Column(columnDefinition = "int not null")
    private Integer patientId;

    @NotNull(message = "caregiver id cannot be null")
    @Positive(message = "caregiver id must be a positive number")
    @Column(columnDefinition = "int not null")
    private Integer caregiverId;

    @NotEmpty(message = "title cannot be empty")
    @Size(min = 3, max = 50, message = "title must be between 3 and 50 characters")
    @Column(columnDefinition = "varchar(50) not null")
    private String title;

    @Size(max = 255, message = "description cannot exceed 255 characters")
    @Column(columnDefinition = "varchar(255)")
    private String description;

    @NotNull(message = "due date time cannot be null")
    @Column(columnDefinition = "datetime not null")
    private LocalDateTime dueDateTime;

    @NotEmpty(message = "priority cannot be empty")
    @Pattern(regexp = "^(low|medium|high)$", message = "priority must be low, medium or high")
    @Column(columnDefinition = "varchar(6) not null")
    @Check(constraints = "priority IN ('low','medium','high')")
    private String priority;

    @Pattern(regexp = "^(pending|completed|cancelled)$", message = "status must be pending, completed or cancelled")
    @Column(columnDefinition = "varchar(9) not null")
    @Check(constraints = "status IN ('pending','completed','cancelled')")
    private String status;


    @PastOrPresent(message = "completed time cannot be in the future")
    @Column(columnDefinition = "datetime")
    private LocalDateTime completedAt;
}
