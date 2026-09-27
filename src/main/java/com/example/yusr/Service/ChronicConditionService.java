package com.example.yusr.Service;


import com.example.yusr.Model.ChronicCondition;
import com.example.yusr.Model.Patient;
import com.example.yusr.Repository.ChronicConditionRepository;
import com.example.yusr.Repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChronicConditionService {

    private final ChronicConditionRepository chronicConditionRepository;
    private final PatientRepository patientRepository;

    public List<ChronicCondition>getChronicConditions(){
        return chronicConditionRepository.findAll();
    }

    public Boolean addChronicCondition(ChronicCondition chronicCondition){
        Patient checkPatient=patientRepository.findPatientById(chronicCondition.getPatientId());

        if (checkPatient==null){
            return false;
        }

        chronicConditionRepository.save(chronicCondition);
        return true;
    }



    public String updateChronicCondition(Integer id, ChronicCondition chronicCondition){

        ChronicCondition oldChronicCondition =chronicConditionRepository.findChronicConditionById(id);

        if (oldChronicCondition == null){
            return "chronic condition not found";
        }

        if (!oldChronicCondition.getPatientId().equals(chronicCondition.getPatientId())){
            return "patient id cannot be changed";
        }
        oldChronicCondition.setConditionName(chronicCondition.getConditionName());
        oldChronicCondition.setDiagnosisDate(chronicCondition.getDiagnosisDate());
        oldChronicCondition.setNotes(chronicCondition.getNotes());

        chronicConditionRepository.save(oldChronicCondition);
        return "updated";
    }

    public Boolean deleteChronicCondition(Integer id){

        ChronicCondition chronicCondition = chronicConditionRepository.findChronicConditionById(id);

        if (chronicCondition == null){
            return false;
        }

        chronicConditionRepository.delete(chronicCondition);
        return true;
    }

}
