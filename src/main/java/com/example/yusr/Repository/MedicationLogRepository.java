package com.example.yusr.Repository;

import com.example.yusr.Model.MedicationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;


@Repository
public interface MedicationLogRepository extends JpaRepository<MedicationLog,Integer> {

    MedicationLog findMedicationLogById(Integer id);

    Boolean existsMedicationLogByScheduleId(Integer scheduleId);

    Boolean existsMedicationLogByScheduleIdAndScheduledDateTime(Integer scheduleId, LocalDateTime scheduledDateTime);

    @Query("select count(ml) from MedicationLog ml " +
            "where ml.scheduleId = ?1 " +
            "and ml.status in ('taken','late') " +
            "and ml.scheduledDateTime >= ?2 " +
            "and ml.scheduledDateTime < ?3")
    Integer countCompletedDoseForToday(Integer scheduleId, LocalDateTime startOfDay, LocalDateTime startOfNextDay);

    @Query("select ml from MedicationLog ml, MedicationSchedule ms, Medication m " +
            "where ml.scheduleId = ms.id " +
            "and ms.medicationId = m.id " +
            "and m.patientId = ?1 " +
            "and ml.scheduledDateTime >= ?2 " +
            "and ml.scheduledDateTime < ?3 " +
            "order by ml.scheduledDateTime")
    List<MedicationLog> getTodayMedicationLogs(Integer patientId, LocalDateTime startOfDay, LocalDateTime startOfNextDay);

    @Query("select count(ml) from MedicationLog ml " +
            "where ml.scheduleId = ?1 " +
            "and ml.scheduledDateTime >= ?2 " +
            "and ml.scheduledDateTime < ?3")
    Integer countRecordedDoseForToday(Integer scheduleId, LocalDateTime startOfDay, LocalDateTime startOfNextDay);

    void deleteAllByScheduleId(Integer scheduleId);

    @Query("select ml from MedicationLog ml, MedicationSchedule ms, Medication m " +
            "where ml.scheduleId = ms.id " +
            "and ms.medicationId = m.id " +
            "and m.patientId = ?1 " +
            "and ml.scheduledDateTime >= ?2 " +
            "and ml.scheduledDateTime < ?3 " +
            "order by ml.scheduledDateTime")
    List<MedicationLog> getMedicationLogsByPatientAndPeriod(Integer patientId, LocalDateTime fromDate, LocalDateTime toDate);
}
