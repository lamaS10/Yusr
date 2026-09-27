package com.example.yusr.Repository;

import com.example.yusr.Model.HealthReading;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface HealthReadingRepository extends JpaRepository<HealthReading,Integer> {
    HealthReading findHealthReadingById(Integer id);
    void deleteAllByPatientId(Integer patientId);
    List<HealthReading> findHealthReadingsByPatientId(Integer patientId);
    HealthReading findTopByPatientIdAndReadingTypeOrderByMeasuredAtDesc(Integer patientId, String readingType);
    HealthReading findTopByPatientIdAndReadingTypeOrderByRecordedAtDesc(Integer patientId, String readingType);
    List<HealthReading> findHealthReadingsByPatientIdAndMeasuredAtBetween(Integer patientId, LocalDateTime fromDate, LocalDateTime toDate);

}
