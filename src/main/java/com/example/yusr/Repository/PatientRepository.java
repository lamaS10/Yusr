package com.example.yusr.Repository;

import com.example.yusr.Model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface PatientRepository extends JpaRepository<Patient,Integer> {

    Patient findPatientById(Integer id);
    Patient findPatientByPatientCode(String patientCode);

}
