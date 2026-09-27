package com.example.yusr.Repository;

import com.example.yusr.Model.MedicationSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MedicationScheduleRepository extends JpaRepository<MedicationSchedule,Integer> {

    MedicationSchedule findMedicationScheduleById(Integer id);
    Boolean existsMedicationScheduleByMedicationId(Integer medicationId);
    @Query("select ms from MedicationSchedule ms, Medication m where ms.medicationId = m.id and m.patientId = ?1 "
            + "and m.status = 'active' " + "and (ms.scheduleType = 'daily' " +
            "or (ms.scheduleType = 'weekly' and ms.dayOfWeek = ?2)) " + "order by ms.scheduledTime")
    List<MedicationSchedule> getTodayMedicationSchedule(Integer patientId, String dayOfWeek);
    List<MedicationSchedule> findMedicationSchedulesByMedicationId(Integer medicationId);
    void deleteAllByMedicationId(Integer medicationId);


}
