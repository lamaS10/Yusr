package com.example.yusr.Service;


import com.example.yusr.Model.CareTask;
import com.example.yusr.Model.Caregiver;
import com.example.yusr.Model.Patient;
import com.example.yusr.Repository.CareTaskRepository;
import com.example.yusr.Repository.CaregiverRepository;
import com.example.yusr.Repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CareTaskService {
    private final CareTaskRepository careTaskRepository;
    private final PatientRepository patientRepository;
    private final CaregiverRepository caregiverRepository;


    public List<CareTask> getCareTasks(){
        return careTaskRepository.findAll();
    }

    public String addCareTask(CareTask careTask){

        Patient patient = patientRepository.findPatientById(careTask.getPatientId());

        if (patient == null){
            return "patient not found";
        }

        Caregiver caregiver = caregiverRepository.findCaregiverById(careTask.getCaregiverId());

        if (caregiver == null){
            return "caregiver not found";
        }

        if (caregiver.getPatientId() == null ||!caregiver.getPatientId().equals(careTask.getPatientId())){
            return "caregiver does not belong to patient";
        }

        careTask.setStatus("pending");
        careTask.setCompletedAt(null);

        careTaskRepository.save(careTask);
        return "added";
    }

    public String updateCareTask(Integer id, CareTask careTask){

        CareTask oldCareTask = careTaskRepository.findCareTaskById(id);

        if (oldCareTask == null){
            return "care task not found";
        }

        if (!oldCareTask.getPatientId().equals(careTask.getPatientId())){
            return "patient id cannot be changed";
        }

        if (!oldCareTask.getCaregiverId().equals(careTask.getCaregiverId())){
            return "caregiver id cannot be changed";
        }

        oldCareTask.setTitle(careTask.getTitle());
        oldCareTask.setDescription(careTask.getDescription());
        oldCareTask.setDueDateTime(careTask.getDueDateTime());
        oldCareTask.setPriority(careTask.getPriority());

        careTaskRepository.save(oldCareTask);
        return "updated";
    }

    public Boolean deleteCareTask(Integer id){

        CareTask careTask = careTaskRepository.findCareTaskById(id);

        if (careTask == null){
            return false;
        }

        careTaskRepository.delete(careTask);
        return true;
    }

    public String completeCareTask(Integer id, LocalDateTime completedAt){

        CareTask careTask = careTaskRepository.findCareTaskById(id);

        if (careTask == null){
            return "care task not found";
        }

        if (careTask.getStatus().equals("completed")){
            return "care task already completed";
        }

        if (careTask.getStatus().equals("cancelled")){
            return "cancelled care task cannot be completed";
        }

        if (completedAt == null){
            completedAt = LocalDateTime.now();
        }

        if (completedAt.isAfter(LocalDateTime.now())){
            return "completed time cannot be in the future";
        }
        if (careTask.getDueDateTime().isAfter(LocalDateTime.now())){
            return "care task cannot be completed before due date";
        }

        careTask.setStatus("completed");
        careTask.setCompletedAt(completedAt);

        careTaskRepository.save(careTask);

        return "completed";
    }

    public String cancelCareTask(Integer id){

        CareTask careTask = careTaskRepository.findCareTaskById(id);

        if (careTask == null){
            return "care task not found";
        }

        if (careTask.getStatus().equals("cancelled")){
            return "care task already cancelled";
        }

        if (careTask.getStatus().equals("completed")){
            return "completed care task cannot be cancelled";
        }

        careTask.setStatus("cancelled");
        careTask.setCompletedAt(null);

        careTaskRepository.save(careTask);

        return "cancelled";
    }

    public List<CareTask> getPatientCareTasks(Integer patientId){

        Patient patient = patientRepository.findPatientById(patientId);

        if (patient == null){
            return null;
        }

        return careTaskRepository.findCareTasksByPatientId(patientId);
    }
}
