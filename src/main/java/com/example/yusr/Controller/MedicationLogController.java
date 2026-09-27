package com.example.yusr.Controller;


import com.example.yusr.ApiResponse.ApiResponse;
import com.example.yusr.Model.MedicationLog;
import com.example.yusr.Service.MedicationLogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.Errors;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/medication-log")
@RequiredArgsConstructor
public class MedicationLogController {
    private final MedicationLogService medicationLogService;

    @GetMapping("/get-medication-logs")
    public ResponseEntity<?>getMedicationLogs(){
        return ResponseEntity.status(200).body(medicationLogService.getMedicationLogs());
    }

    @PostMapping("/add-medication-log")
    public ResponseEntity<?>addMedicationLog(@RequestBody @Valid MedicationLog medicationLog, Errors errors){
        if (errors.hasErrors()){
            String message=errors.getFieldError().getDefaultMessage();
            return ResponseEntity.status(400).body(message);
        }
        String checkAdd=medicationLogService.addMedicationLog(medicationLog);
        if (checkAdd.equals("medication schedule not found")){
            return ResponseEntity.status(404).body(new ApiResponse("didn't find medication schedule"));
        }
        if (checkAdd.equals("medication log already exists")){
            return ResponseEntity.status(400).body(new ApiResponse("medication log already exists"));
        }
        if (checkAdd.equals("medication not found")){
            return ResponseEntity.status(404).body(new ApiResponse("didn't find medication"));
        }
        if (checkAdd.equals("medication is out of stock")){
            return ResponseEntity.status(400).body(new ApiResponse("medication is out of stock"));
        }

        return ResponseEntity.status(200).body(new ApiResponse("the medication log is added successfully"));
    }


    @PutMapping("/update-medication-log/{id}")
    public ResponseEntity<?>updateMedicationLog(@PathVariable Integer id,@RequestBody @Valid MedicationLog medicationLog, Errors errors){
        if (errors.hasErrors()){
            String message=errors.getFieldError().getDefaultMessage();
            return ResponseEntity.status(400).body(message);
        }

        String checkUpdate=medicationLogService.updateMedicationLog(id, medicationLog);
        if (checkUpdate.equals("medication log not found")){
            return ResponseEntity.status(404).body(new ApiResponse("didn't find medication log"));
        }
        if (checkUpdate.equals("schedule id cannot be changed")){
            return ResponseEntity.status(400).body(new ApiResponse("schedule id cannot be changed"));
        }
        if (checkUpdate.equals("scheduled date time cannot be changed")){
            return ResponseEntity.status(400).body(new ApiResponse("scheduled date time cannot be changed"));
        }
        if (checkUpdate.equals("medication is out of stock")){
            return ResponseEntity.status(400).body(new ApiResponse("medication is out of stock"));
        }

        return ResponseEntity.status(200).body(new ApiResponse("the medication log is updated successfully"));

    }


    @DeleteMapping("/delete-medication-log/{id}")
    public ResponseEntity<?>deleteMedicationLog(@PathVariable Integer id){
        Boolean isDeleted=medicationLogService.deleteMedicationLog(id);
        if (isDeleted){
            return ResponseEntity.status(200).body(new ApiResponse("the medication log is deleted successfully"));
        }
        return ResponseEntity.status(404).body(new ApiResponse("didn't find medication log"));

    }

    @GetMapping("/get-today-medication-summary/{patientId}")
    public ResponseEntity<?> getTodayMedicationSummary(@PathVariable Integer patientId){

        String summary = medicationLogService.getTodayMedicationSummary(patientId);

        if (summary.equals("patient not found")){
            return ResponseEntity.status(404).body(new ApiResponse("patient not found"));
        }

        return ResponseEntity.status(200).body(new ApiResponse(summary));
    }

    @GetMapping("/get-today-medication-logs/{patientId}")
    public ResponseEntity<?> getTodayMedicationLogs(@PathVariable Integer patientId){

        List<MedicationLog> medicationLogs = medicationLogService.getTodayMedicationLogs(patientId);

        if (medicationLogs == null){
            return ResponseEntity.status(404).body(new ApiResponse("patient not found"));
        }

        if (medicationLogs.isEmpty()){
            return ResponseEntity.status(200).body(new ApiResponse("no medication logs recorded today"));
        }

        return ResponseEntity.status(200).body(medicationLogs);
    }
}
