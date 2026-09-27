package com.example.yusr.Repository;

import com.example.yusr.Model.ChronicCondition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChronicConditionRepository extends JpaRepository<ChronicCondition,Integer> {
    ChronicCondition findChronicConditionById(Integer id);
    void deleteAllByPatientId(Integer patientId);
    List<ChronicCondition> findChronicConditionsByPatientId(Integer patientId);

}
