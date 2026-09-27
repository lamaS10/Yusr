package com.example.yusr.Repository;

import com.example.yusr.Model.Incident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;


@Repository
public interface IncidentRepository extends JpaRepository<Incident,Integer> {
    Incident findIncidentById(Integer id);
    void deleteAllByPatientId(Integer patientId);
    List<Incident> findIncidentsByPatientId(Integer patientId);
    List<Incident> findIncidentsByPatientIdAndIncidentAtBetween(Integer patientId, LocalDateTime fromDate, LocalDateTime toDate);

}
