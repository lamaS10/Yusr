package com.example.yusr.Repository;

import com.example.yusr.Model.Medication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MedicationRepository extends JpaRepository<Medication,Integer> {
    Medication findMedicationById(Integer id);

    @Query("select m from Medication m where m.patientId=?1 and m.status='active' " +
            "and (m.stockQuantity<=m.lowStockLimit " +
            "or (m.endDate is not null and m.endDate>=?2 and m.endDate<=?3))")
    List<Medication> getMedicationAlerts(Integer patientId, LocalDate today, LocalDate afterSevenDays);

    List<Medication> findMedicationsByPatientId(Integer patientId);
    void deleteAllByPatientId(Integer patientId);

}
