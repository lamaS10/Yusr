package com.example.yusr.Repository;


import com.example.yusr.Model.Handover;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface HandoverRepository extends JpaRepository<Handover,Integer> {
    Handover findHandoverById(Integer id);

    Boolean existsHandoverByFromCaregiverId(Integer fromCaregiverId);

    Boolean existsHandoverByToCaregiverId(Integer toCaregiverId);

    Boolean existsHandoverByPatientId(Integer patientId);
    void deleteAllByPatientId(Integer patientId);
    Boolean existsHandoverByPatientIdAndStatus(Integer patientId, String status);
    Handover findHandoverByToCaregiverIdAndStatus(Integer toCaregiverId, String status);
    List<Handover> findHandoversByFromCaregiverIdOrderByCreatedAtDesc(Integer fromCaregiverId);
    List<Handover> findHandoversByStatusAndExpectedAcceptanceAtBeforeAndOverdueAlertSent(String status, LocalDateTime expectedAcceptanceAt, Boolean overdueAlertSent);
}
