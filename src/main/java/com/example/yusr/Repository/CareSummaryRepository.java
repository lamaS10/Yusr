package com.example.yusr.Repository;

import com.example.yusr.Model.CareSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CareSummaryRepository extends JpaRepository<CareSummary, Integer> {

    CareSummary findCareSummaryById(Integer id);

    CareSummary findCareSummaryByPatientId(Integer patientId);
}