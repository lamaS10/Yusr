package com.example.yusr.Repository;

import com.example.yusr.Model.CareTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CareTaskRepository extends JpaRepository<CareTask,Integer> {
    CareTask findCareTaskById(Integer id);

    Boolean existsCareTaskByCaregiverId(Integer caregiverId);

    Boolean existsCareTaskByPatientId(Integer patientId);
    void deleteAllByPatientId(Integer patientId);
    List<CareTask> findCareTasksByPatientId(Integer patientId);
    List<CareTask> findCareTasksByPatientIdAndCaregiverIdAndStatus(Integer patientId, Integer caregiverId, String status);
    List<CareTask> findCareTasksByPatientIdAndDueDateTimeBetween(Integer patientId, LocalDateTime fromDate, LocalDateTime toDate);
}
