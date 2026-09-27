package com.example.yusr.Controller;


import com.example.yusr.ApiResponse.ApiResponse;
import com.example.yusr.Model.MedicationSchedule;
import com.example.yusr.Service.MedicationScheduleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.Errors;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/medication-schedule")
@RequiredArgsConstructor
public class MedicationScheduleController {

    private final MedicationScheduleService medicationScheduleService;

    @GetMapping("/get-medication-schedules")
    public ResponseEntity<?>getMedicationSchedules(){
        return ResponseEntity.status(200).body(medicationScheduleService.getMedicationSchedules());
    }

    @PostMapping("/add-medication-schedule")
    public ResponseEntity<?>addMedicationSchedule(@RequestBody @Valid MedicationSchedule medicationSchedule, Errors errors){
        if (errors.hasErrors()){
            String message=errors.getFieldError().getDefaultMessage();
            return ResponseEntity.status(400).body(message);
        }

        String checkAdd=medicationScheduleService.addMedicationSchedule(medicationSchedule);
        if (checkAdd.equals("medication not found")){
            return ResponseEntity.status(404).body(new ApiResponse("didn't find medication id"));
        }
        if (checkAdd.equals("day of week must be empty for daily schedule")){
            return ResponseEntity.status(400).body(new ApiResponse("day of week must be empty for daily schedule"));
        }
        if (checkAdd.equals("day of week is required for weekly schedule")){
            return ResponseEntity.status(400).body(new ApiResponse("day of week is required for weekly schedule"));
        }

        return ResponseEntity.status(200).body(new ApiResponse("medication schedule is added successfully"));
    }


    @PutMapping("/update-medication-schedule/{id}")
    public ResponseEntity<?>updateMedicationSchedule(@PathVariable Integer id,@RequestBody @Valid MedicationSchedule medicationSchedule, Errors errors){
        if (errors.hasErrors()){
            String message=errors.getFieldError().getDefaultMessage();
            return ResponseEntity.status(400).body(message);
        }

        String checkUpdated=medicationScheduleService.updateMedicationSchedule(id, medicationSchedule);

        if (checkUpdated.equals("medication schedule not found")){
            return ResponseEntity.status(404).body(new ApiResponse("didn't find medication schedule id"));
        }
        if (checkUpdated.equals("medication id cannot be changed")){
            return ResponseEntity.status(400).body(new ApiResponse("medication id can't be changed"));
        }
        if (checkUpdated.equals("day of week must be empty for daily schedule")){
            return ResponseEntity.status(400).body(new ApiResponse("day of week must be empty for daily schedule"));
        }
        if (checkUpdated.equals("day of week is required for weekly schedule")){
            return ResponseEntity.status(400).body(new ApiResponse("day of week is required for weekly schedule"));
        }

        return ResponseEntity.status(200).body(new ApiResponse("Medication Schedule is updated successfully"));
    }


    @DeleteMapping("/delete-medication-schedule/{id}")
    public ResponseEntity<?>deleteMedicationSchedule(@PathVariable Integer id){
        String checkDeleted=medicationScheduleService.deleteMedicationSchedule(id);

        if (checkDeleted.equals("medication schedule not found")){
            return ResponseEntity.status(404).body(new ApiResponse("didn't find medication schedule id"));
        }
        if (checkDeleted.equals("medication schedule has logs")){
            return ResponseEntity.status(400).body(new ApiResponse("you can't delete because medication schedule has logs"));
        }

        return ResponseEntity.status(200).body(new ApiResponse("Medication Schedule is deleted successfully"));


    }

    @GetMapping("/get-today-medication-schedule/{patientId}")
    public ResponseEntity<?> getTodayMedicationSchedule(@PathVariable Integer patientId){

        List<MedicationSchedule> schedules = medicationScheduleService.getTodayMedicationSchedule(patientId);

        if (schedules == null){
            return ResponseEntity.status(404).body(new ApiResponse("patient not found"));
        }

        if (schedules.isEmpty()){
            return ResponseEntity.status(200).body(new ApiResponse("patient has no medications scheduled for today"));
        }

        return ResponseEntity.status(200).body(schedules);
    }

}
