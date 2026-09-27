package com.example.yusr.Controller;


import com.example.yusr.ApiResponse.ApiResponse;
import com.example.yusr.Model.Patient;
import com.example.yusr.Service.PatientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.Errors;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/patient")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    @GetMapping("/get-patients")
    public ResponseEntity<?>getPatients(){
        return ResponseEntity.status(200).body(patientService.getPatients());
    }

    @PostMapping("/add-patient")
    public ResponseEntity<?>addPatient(@RequestBody @Valid Patient patient, Errors errors){
        if (errors.hasErrors()){
            String message=errors.getFieldError().getDefaultMessage();
            return ResponseEntity.status(400).body(message);
        }
        patientService.addPatient(patient);
        return ResponseEntity.status(200).body(new ApiResponse("the patient added successfully"));
    }

    @PutMapping("/update-patient/{id}")
    public ResponseEntity<?>updatePatient(@PathVariable Integer id,@RequestBody @Valid Patient patient, Errors errors){
        if (errors.hasErrors()){
            String message=errors.getFieldError().getDefaultMessage();
            return ResponseEntity.status(400).body(message);
        }
        Boolean isUpdated=patientService.updatePatient(id,patient);
        if (isUpdated){
            return ResponseEntity.status(200).body(new ApiResponse("the patient with id: "+id+" is updated successfully"));
        }
        return ResponseEntity.status(404).body(new ApiResponse("didn't find the requested id"));
    }


    @DeleteMapping("/delete-patient/{patientId}/{caregiverId}")
    public ResponseEntity<?> deletePatient(@PathVariable Integer patientId, @PathVariable Integer caregiverId){

        String result = patientService.deletePatient(patientId, caregiverId);

        if (result.equals("patient not found") || result.equals("caregiver not found")){
            return ResponseEntity.status(404).body(new ApiResponse(result));
        }

        if (!result.equals("deleted")){
            return ResponseEntity.status(400).body(new ApiResponse(result));
        }

        return ResponseEntity.status(200).body(new ApiResponse("patient and all related data deleted successfully"));
    }

    @PostMapping("/add-patient-by-caregiver/{caregiverId}")
    public ResponseEntity<?> addPatientByCaregiver(@PathVariable Integer caregiverId, @RequestBody @Valid Patient patient, Errors errors){

        if (errors.hasErrors()){
            String message = errors.getFieldError().getDefaultMessage();
            return ResponseEntity.status(400).body(message);
        }

        String checkAdded = patientService.addPatientByCaregiver(caregiverId, patient);

        if (checkAdded.equals("caregiver not found")){
            return ResponseEntity.status(404).body(new ApiResponse("caregiver not found"));
        }

        if (checkAdded.equals("caregiver already has patient")){
            return ResponseEntity.status(400).body(new ApiResponse("caregiver already has patient"));
        }

        return ResponseEntity.status(200).body(new ApiResponse("the patient added successfully"));
    }

    @GetMapping("/get-patient/{id}")
    public ResponseEntity<?> getPatientById(@PathVariable Integer id){

        Patient patient = patientService.getPatientById(id);

        if (patient == null){
            return ResponseEntity.status(404).body(new ApiResponse("patient not found"));
        }

        return ResponseEntity.status(200).body(patient);
    }

    @PostMapping("/link-existing-patient/{caregiverId}")
    public ResponseEntity<?> linkExistingPatient(
            @PathVariable Integer caregiverId,
            @RequestParam String patientCode){

        String result =
                patientService.linkExistingPatient(
                        caregiverId,
                        patientCode
                );

        if (result.equals("caregiver not found") ||
                result.equals("patient not found")) {

            return ResponseEntity.status(404)
                    .body(new ApiResponse(result));
        }

        if (!result.equals("linked")) {

            return ResponseEntity.status(400)
                    .body(new ApiResponse(result));
        }

        return ResponseEntity.status(200)
                .body(new ApiResponse(
                        "patient linked successfully"
                ));
    }


}
