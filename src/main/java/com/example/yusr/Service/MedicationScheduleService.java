package com.example.yusr.Service;


import com.example.yusr.Model.Medication;
import com.example.yusr.Model.MedicationSchedule;
import com.example.yusr.Model.Patient;
import com.example.yusr.Repository.MedicationLogRepository;
import com.example.yusr.Repository.MedicationRepository;
import com.example.yusr.Repository.MedicationScheduleRepository;
import com.example.yusr.Repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MedicationScheduleService {
    private final MedicationScheduleRepository medicationScheduleRepository;
    private final MedicationRepository medicationRepository;
    private final MedicationLogRepository medicationLogRepository;
    private final PatientRepository patientRepository;

    public List<MedicationSchedule>getMedicationSchedules(){
        return medicationScheduleRepository.findAll();
    }

    public String addMedicationSchedule(MedicationSchedule medicationSchedule){

        Medication medication =medicationRepository.findMedicationById(medicationSchedule.getMedicationId());

        if (medication == null){
            return "medication not found";
        }

        if (medicationSchedule.getScheduleType().equals("daily") && medicationSchedule.getDayOfWeek() != null){
            return "day of week must be empty for daily schedule";
        }

        if (medicationSchedule.getScheduleType().equals("weekly") && medicationSchedule.getDayOfWeek() == null){
            return "day of week is required for weekly schedule";
        }

        medicationScheduleRepository.save(medicationSchedule);
        return "added";
    }

    public String updateMedicationSchedule(Integer id, MedicationSchedule medicationSchedule){

        MedicationSchedule oldMedicationSchedule = medicationScheduleRepository.findMedicationScheduleById(id);

        if (oldMedicationSchedule == null){
            return "medication schedule not found";
        }

        if (!oldMedicationSchedule.getMedicationId().equals(medicationSchedule.getMedicationId())){
            return "medication id cannot be changed";
        }

        if (medicationSchedule.getScheduleType().equals("daily") && medicationSchedule.getDayOfWeek() != null){
            return "day of week must be empty for daily schedule";
        }

        if (medicationSchedule.getScheduleType().equals("weekly") && medicationSchedule.getDayOfWeek() == null){
            return "day of week is required for weekly schedule";
        }

        oldMedicationSchedule.setScheduleType(medicationSchedule.getScheduleType());
        oldMedicationSchedule.setDayOfWeek(medicationSchedule.getDayOfWeek());
        oldMedicationSchedule.setScheduledTime(medicationSchedule.getScheduledTime());

        medicationScheduleRepository.save(oldMedicationSchedule);
        return "updated";
    }

    public String deleteMedicationSchedule(Integer id){

        MedicationSchedule medicationSchedule =
                medicationScheduleRepository.findMedicationScheduleById(id);

        if (medicationSchedule == null){
            return "medication schedule not found";
        }

        Boolean hasLogs = medicationLogRepository.existsMedicationLogByScheduleId(id);

        if (hasLogs){
            return "medication schedule has logs";
        }

        medicationScheduleRepository.delete(medicationSchedule);
        return "deleted";
    }


    public List<MedicationSchedule> getTodayMedicationSchedule(Integer patientId){

        Patient patient = patientRepository.findPatientById(patientId);

        if (patient == null){
            return null;
        }

        String dayOfWeek = LocalDate.now().getDayOfWeek().toString().toLowerCase();

        return medicationScheduleRepository.getTodayMedicationSchedule(patientId, dayOfWeek);
    }


}
