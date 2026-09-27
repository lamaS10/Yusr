package com.example.yusr.Controller;


import com.example.yusr.ApiResponse.ApiResponse;
import com.example.yusr.Model.Medication;
import com.example.yusr.Service.MedicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.Errors;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/medication")
@RequiredArgsConstructor
public class MedicationController {

    private final MedicationService medicationService;

    @GetMapping("/get-medications")
    public ResponseEntity<?>getMedications(){
        return ResponseEntity.status(200).body(medicationService.getMedications());
    }

    @PostMapping("/add-medication")
    public ResponseEntity<?>addMedication(@RequestBody @Valid Medication medication, Errors errors){
        if (errors.hasErrors()){
            String message=errors.getFieldError().getDefaultMessage();
            return ResponseEntity.status(400).body(message);
        }

        String checkAdded=medicationService.addMedication(medication);
        if (checkAdded.equals("patient not found")){
            return ResponseEntity.status(404).body(new ApiResponse("didn't find patient id"));
        }

        if (checkAdded.equals("end date cannot be before start date")){
            return ResponseEntity.status(400).body(new ApiResponse("please enter valid date ,end date cannot be before start date"));
        }
        return ResponseEntity.status(200).body(new ApiResponse("the medication is added successfully"));
    }


    @PutMapping("/update-medication/{id}")
    public ResponseEntity<?>updateMedication(@PathVariable Integer id,@RequestBody @Valid Medication medication, Errors errors){
        if (errors.hasErrors()){
            String message=errors.getFieldError().getDefaultMessage();
            return ResponseEntity.status(400).body(message);
        }

        String checkUpdate=medicationService.updateMedication(id, medication);
        if (checkUpdate.equals("medication not found")){
            return ResponseEntity.status(404).body(new ApiResponse("didn't find medication with requested id"));
        }

        if (checkUpdate.equals("patient id cannot be changed")){
            return ResponseEntity.status(400).body(new ApiResponse("patient id can't be changed"));
        }
        if (checkUpdate.equals("end date cannot be before start date")){
            return ResponseEntity.status(400).body(new ApiResponse("please enter valid date ,end date cannot be before start date"));
        }

        return ResponseEntity.status(200).body(new ApiResponse("the medication is updated successfully"));

    }

    @DeleteMapping("/delete-medication/{id}")
    public ResponseEntity<?>deleteMedication(@PathVariable Integer id){

        String checkDeleted = medicationService.deleteMedication(id);

        if (checkDeleted.equals("medication not found")){
            return ResponseEntity.status(404).body(new ApiResponse("didn't find medication with requested id"));
        }

        if (checkDeleted.equals("medication has schedules")){
            return ResponseEntity.status(400).body(new ApiResponse("you can't delete because medication has schedules"));
        }

        return ResponseEntity.status(200).body(new ApiResponse("the medication is deleted successfully"));
    }

    @PutMapping("/discontinue-medication/{medicationId}")
    public ResponseEntity<?> discontinueMedication(@PathVariable Integer medicationId){

        String checkDiscontinued = medicationService.discontinueMedication(medicationId);

        if (checkDiscontinued.equals("medication not found")){
            return ResponseEntity.status(404).body(new ApiResponse("medication not found"));
        }

        if (checkDiscontinued.equals("medication already discontinued")){
            return ResponseEntity.status(400).body(new ApiResponse("medication is already discontinued"));
        }

        return ResponseEntity.status(200).body(new ApiResponse("medication is discontinued successfully"));
    }

    @GetMapping("/get-medication-Warnings/{patientId}")
    public ResponseEntity<?> getMedicationWarnings(@PathVariable Integer patientId){

        List<Medication> medications = medicationService.getMedicationWarnings(patientId);

        if (medications == null){
            return ResponseEntity.status(404).body(new ApiResponse("patient not found"));
        }

        if (medications.isEmpty()){
            return ResponseEntity.status(200).body(new ApiResponse("there are no medication alerts"));
        }

        return ResponseEntity.status(200).body(medications);
    }

    @GetMapping("/get-patient-medications/{patientId}")
    public ResponseEntity<?> getPatientMedications(@PathVariable Integer patientId){

        List<Medication> medications = medicationService.getPatientMedications(patientId);

        if (medications == null){
            return ResponseEntity.status(404).body(new ApiResponse("patient not found"));
        }

        if (medications.isEmpty()){
            return ResponseEntity.status(200).body(new ApiResponse("patient has no medications"));
        }

        return ResponseEntity.status(200).body(medications);
    }

    @PutMapping("/add-medication-stock/{medicationId}")
    public ResponseEntity<?> addMedicationStock(@PathVariable Integer medicationId, @RequestParam Integer quantity){

        String checkStock = medicationService.addMedicationStock(medicationId, quantity);

        if (checkStock.equals("medication not found")){
            return ResponseEntity.status(404).body(new ApiResponse("medication not found"));
        }

        if (checkStock.equals("quantity must be more than zero")){
            return ResponseEntity.status(400).body(new ApiResponse("quantity must be more than zero"));
        }

        return ResponseEntity.status(200).body(new ApiResponse("medication stock is added successfully"));
    }

    @PutMapping("/reactivate-medication/{medicationId}")
    public ResponseEntity<?> reactivateMedication(
            @PathVariable Integer medicationId,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate){

        String checkReactivated =
                medicationService.reactivateMedication(
                        medicationId,
                        startDate,
                        endDate
                );

        if (checkReactivated.equals("medication not found")){
            return ResponseEntity.status(404).body(new ApiResponse("medication not found"));
        }

        if (checkReactivated.equals("medication already active")){
            return ResponseEntity.status(400).body(new ApiResponse("medication is already active"));
        }

        if (checkReactivated.equals("end date cannot be before start date")){
            return ResponseEntity.status(400).body(new ApiResponse("end date cannot be before start date"));
        }

        return ResponseEntity.status(200).body(new ApiResponse("medication is reactivated successfully"));
    }
}
