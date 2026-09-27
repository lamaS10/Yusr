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
public class MedicationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotNull(message = "schedule id cannot be null")
    @Positive(message = "schedule id must be a positive number")
    @Column(columnDefinition = "int not null")
    private Integer scheduleId;

    @NotNull(message = "scheduled date time cannot be null")
    @Column(columnDefinition = "datetime not null")
    private LocalDateTime scheduledDateTime;

    @PastOrPresent(message = "taken time cannot be in the future")
    @Column(columnDefinition = "datetime")
    private LocalDateTime takenAt;

    @Column(columnDefinition = "datetime not null")
    private LocalDateTime recordedAt;

    @Pattern(regexp = "^(taken|missed|late)$", message = "status must be taken, missed or late")
    @Column(columnDefinition = "varchar(6) not null")
    @Check(constraints = "status IN ('taken','missed','late')")
    private String status;
}
