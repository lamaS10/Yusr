package com.example.yusr.Model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Check;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class CareSummary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotNull(message = "patient id cannot be null")
    @Column(columnDefinition = "int not null")
    private Integer patientId;

    @Column(columnDefinition = "text not null")
    private String summary;

    @Column(columnDefinition = "date not null")
    private LocalDate fromDate;

    @Column(columnDefinition = "date not null")
    private LocalDate toDate;

    @Column(columnDefinition = "datetime not null")
    private LocalDateTime generatedAt;

    @Check(constraints = "generation_type IN ('on_demand','automatic')")
    @Column(columnDefinition = "varchar(10) not null")
    private String generationType;
}