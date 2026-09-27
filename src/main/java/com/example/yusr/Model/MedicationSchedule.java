package com.example.yusr.Model;


import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Check;

import java.time.LocalTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class MedicationSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotNull(message = "medication id cannot be null")
    @Positive(message = "medication id must be a positive number")
    @Column(columnDefinition = "int not null")
    private Integer medicationId;

    @NotEmpty(message = "schedule type cannot be empty")
    @Pattern(regexp = "^(daily|weekly)$", message = "schedule type must be daily or weekly")
    @Column(columnDefinition = "varchar(6) not null")
    @Check(constraints = "schedule_type IN ('daily','weekly')")
    private String scheduleType;

    @Pattern(regexp = "^(monday|tuesday|wednesday|thursday|friday|saturday|sunday)$", message = "invalid day of week")
    @Column(columnDefinition = "varchar(9)")
    private String dayOfWeek;

    @NotNull(message = "scheduled time cannot be null")
    @Column(columnDefinition = "time not null")
    private LocalTime scheduledTime;
}
