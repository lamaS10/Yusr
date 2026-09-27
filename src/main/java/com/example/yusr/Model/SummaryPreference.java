package com.example.yusr.Model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Check;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class SummaryPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotNull(message = "caregiver id cannot be null")
    @Column(columnDefinition = "int not null")
    private Integer caregiverId;

    @Check(constraints = "frequency IN ('daily','weekly','monthly')")
    @Column(columnDefinition = "varchar(7) not null")
    private String frequency;

    @NotNull(message = "auto generate cannot be null")
    @Column(columnDefinition = "boolean not null")
    private Boolean autoGenerate;

    private LocalDateTime lastGeneratedAt;

    private LocalDateTime nextGenerationAt;
}