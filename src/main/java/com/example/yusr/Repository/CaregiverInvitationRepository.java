package com.example.yusr.Repository;

import com.example.yusr.Model.CaregiverInvitation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CaregiverInvitationRepository  extends JpaRepository<CaregiverInvitation, Integer> {
    CaregiverInvitation findCaregiverInvitationById(Integer id);

    CaregiverInvitation findCaregiverInvitationByEmailAndStatus(String email, String status);

    CaregiverInvitation findCaregiverInvitationByPatientIdAndEmailAndStatus(Integer patientId, String email, String status);

    CaregiverInvitation findCaregiverInvitationByPhoneNumberAndStatus(String phoneNumber, String status);
    void deleteAllByPatientId(Integer patientId);

    List<CaregiverInvitation> findCaregiverInvitationsByPatientIdAndStatus(Integer patientId, String status);
}
