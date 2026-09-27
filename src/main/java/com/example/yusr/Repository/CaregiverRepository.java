package com.example.yusr.Repository;

import com.example.yusr.Model.Caregiver;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CaregiverRepository extends JpaRepository<Caregiver,Integer> {

    Caregiver findCaregiverById(Integer id);
    Caregiver findCaregiverByPatientIdAndRole(Integer patientId, String role);
    Caregiver findCaregiverByEmail(String email);
    Caregiver findCaregiverByPhoneNumber(String phoneNumber);
    List<Caregiver> findCaregiversByPatientId(Integer patientId);
    Boolean existsCaregiverByPatientId(Integer patientId);
    Boolean existsCaregiverByPatientIdAndIdNot(Integer patientId, Integer caregiverId);
}
