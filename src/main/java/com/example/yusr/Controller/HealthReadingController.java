package com.example.yusr.Controller;


import com.example.yusr.ApiResponse.ApiResponse;
import com.example.yusr.Model.HealthReading;
import com.example.yusr.Service.HealthReadingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.Errors;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/health-reading")
@RequiredArgsConstructor
public class HealthReadingController {

    private final HealthReadingService healthReadingService;

    @GetMapping("/get-health-readings")
    public ResponseEntity<?>getHealthReadings(){
        return ResponseEntity.status(200).body(healthReadingService.getHealthReadings());
    }

    @PostMapping("/add-health-reading")
    public ResponseEntity<?> addHealthReading(@RequestBody @Valid HealthReading healthReading, Errors errors){
        if (errors.hasErrors()){
            String message = errors.getFieldError().getDefaultMessage();
            return ResponseEntity.status(400).body(message);
        }

        String checkAdd = healthReadingService.addHealthReading(healthReading);

        if (checkAdd.equals("patient not found")){
            return ResponseEntity.status(404).body(new ApiResponse("didn't find patient"));
        }

        if (checkAdd.equals("blood pressure requires systolic and diastolic values")){
            return ResponseEntity.status(400).body(new ApiResponse("blood pressure requires systolic and diastolic values"));
        }

        if (checkAdd.equals("reading value must be empty for blood pressure")){
            return ResponseEntity.status(400).body(new ApiResponse("reading value must be empty for blood pressure"));
        }

        if (checkAdd.equals("reading value is required")){
            return ResponseEntity.status(400).body(new ApiResponse("reading value is required"));
        }

        if (checkAdd.equals("systolic and diastolic values must be empty")){
            return ResponseEntity.status(400).body(new ApiResponse("systolic and diastolic values must be empty"));
        }
        if (checkAdd.equals("glucose measurement type is required")){
            return ResponseEntity.status(400).body(new ApiResponse("glucose measurement type is required"));
        }

        return ResponseEntity.status(200).body(new ApiResponse("health reading is added successfully"));
    }

    @PutMapping("/update-health-reading/{id}")
    public ResponseEntity<?> updateHealthReading(@PathVariable Integer id, @RequestBody @Valid HealthReading healthReading, Errors errors){
        if (errors.hasErrors()){
            String message = errors.getFieldError().getDefaultMessage();
            return ResponseEntity.status(400).body(message);
        }

        String checkUpdate = healthReadingService.updateHealthReading(id, healthReading);

        if (checkUpdate.equals("health reading not found")){
            return ResponseEntity.status(404).body(new ApiResponse("didn't find health reading"));
        }

        if (checkUpdate.equals("patient id cannot be changed")){
            return ResponseEntity.status(400).body(new ApiResponse("patient id cannot be changed"));
        }

        if (checkUpdate.equals("blood pressure requires systolic and diastolic values")){
            return ResponseEntity.status(400).body(new ApiResponse("blood pressure requires systolic and diastolic values"));
        }

        if (checkUpdate.equals("reading value must be empty for blood pressure")){
            return ResponseEntity.status(400).body(new ApiResponse("reading value must be empty for blood pressure"));
        }

        if (checkUpdate.equals("reading value is required")){
            return ResponseEntity.status(400).body(new ApiResponse("reading value is required"));
        }

        if (checkUpdate.equals("systolic and diastolic values must be empty")){
            return ResponseEntity.status(400).body(new ApiResponse("systolic and diastolic values must be empty"));
        }
        if (checkUpdate.equals("glucose measurement type is required")){
            return ResponseEntity.status(400).body(new ApiResponse("glucose measurement type is required"));
        }

        return ResponseEntity.status(200).body(new ApiResponse("health reading is updated successfully"));
    }

    @DeleteMapping("/delete-health-reading/{id}")
    public ResponseEntity<?> deleteHealthReading(@PathVariable Integer id){

        Boolean isDeleted = healthReadingService.deleteHealthReading(id);

        if (isDeleted){
            return ResponseEntity.status(200).body(new ApiResponse("health reading is deleted successfully"));
        }

        return ResponseEntity.status(404).body(new ApiResponse("didn't find health reading"));
    }

    @GetMapping("/get-patient-health-readings/{patientId}")
    public ResponseEntity<?> getPatientHealthReadings(@PathVariable Integer patientId){

        List<HealthReading> healthReadings = healthReadingService.getPatientHealthReadings(patientId);

        if (healthReadings == null){
            return ResponseEntity.status(404).body(new ApiResponse("patient not found"));
        }

        if (healthReadings.isEmpty()){
            return ResponseEntity.status(200).body(new ApiResponse("patient has no health readings"));
        }

        return ResponseEntity.status(200).body(healthReadings);
    }

    @GetMapping("/get-latest-health-readings/{patientId}")
    public ResponseEntity<?> getLatestHealthReadings(@PathVariable Integer patientId){

        List<HealthReading> healthReadings = healthReadingService.getLatestHealthReadings(patientId);

        if (healthReadings == null){
            return ResponseEntity.status(404).body(new ApiResponse("patient not found"));
        }

        if (healthReadings.isEmpty()){
            return ResponseEntity.status(200).body(new ApiResponse("patient has no health readings"));
        }

        return ResponseEntity.status(200).body(healthReadings);
    }

    @GetMapping("/get-abnormal-health-readings/{patientId}")
    public ResponseEntity<?> getAbnormalHealthReadings(@PathVariable Integer patientId){

        List<HealthReading> healthReadings = healthReadingService.getAbnormalHealthReadings(patientId);

        if (healthReadings == null){
            return ResponseEntity.status(404).body(new ApiResponse("patient not found"));
        }

        if (healthReadings.isEmpty()){
            return ResponseEntity.status(200).body(new ApiResponse("patient has no abnormal health readings"));
        }

        return ResponseEntity.status(200).body(healthReadings);
    }
}
