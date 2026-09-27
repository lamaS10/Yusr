package com.example.yusr.Controller;

import com.example.yusr.ApiResponse.ApiResponse;
import com.example.yusr.Model.SummaryPreference;
import com.example.yusr.Service.SummaryPreferenceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.Errors;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/summary-preference")
@RequiredArgsConstructor
public class SummaryPreferenceController {

    private final SummaryPreferenceService summaryPreferenceService;


    @GetMapping("/get-summary-preference/{caregiverId}")
    public ResponseEntity<?> getSummaryPreferenceByCaregiverId(@PathVariable Integer caregiverId) {

        SummaryPreference summaryPreference = summaryPreferenceService.getSummaryPreferenceByCaregiverId(caregiverId);

        if (summaryPreference == null) {
            return ResponseEntity.status(404).body(new ApiResponse("summary preference not found"));
        }

        return ResponseEntity.status(200).body(summaryPreference);
    }


    @PostMapping("/add-summary-preference")
    public ResponseEntity<?> addSummaryPreference(@RequestBody @Valid SummaryPreference summaryPreference, Errors errors) {

        if (errors.hasErrors()) {
            String message = errors.getFieldError().getDefaultMessage();
            return ResponseEntity.status(400).body(new ApiResponse(message));
        }

        String result = summaryPreferenceService.addSummaryPreference(summaryPreference);

        if (result.equals("caregiver not found")) {
            return ResponseEntity.status(404).body(new ApiResponse(result));
        }

        if (result.equals("caregiver is not assigned to a patient") || result.equals("summary preference already exists, you can update it")) {

            return ResponseEntity.status(400).body(new ApiResponse(result));
        }

        return ResponseEntity.status(200).body(new ApiResponse(result));
    }


    @PutMapping("/update-summary-preference/{id}")
    public ResponseEntity<?> updateSummaryPreference(@PathVariable Integer id, @RequestBody @Valid SummaryPreference summaryPreference, Errors errors) {

        if (errors.hasErrors()) {
            String message = errors.getFieldError().getDefaultMessage();
            return ResponseEntity.status(400).body(new ApiResponse(message));
        }

        String result = summaryPreferenceService.updateSummaryPreference(id, summaryPreference);

        if (result.equals("summary preference not found") || result.equals("caregiver not found")) {
            return ResponseEntity.status(404).body(new ApiResponse(result));
        }

        if (result.equals("caregiver id cannot be changed") || result.equals("caregiver is not assigned to a patient")) {
            return ResponseEntity.status(400).body(new ApiResponse(result));
        }

        return ResponseEntity.status(200).body(new ApiResponse(result));
    }


    @DeleteMapping("/delete-summary-preference/{id}")
    public ResponseEntity<?> deleteSummaryPreference(@PathVariable Integer id) {

        Boolean isDeleted = summaryPreferenceService.deleteSummaryPreference(id);

        if (!isDeleted) {
            return ResponseEntity.status(404).body(new ApiResponse("summary preference not found"));
        }

        return ResponseEntity.status(200).body(new ApiResponse("summary preference deleted successfully"));
    }

    @PutMapping("/change-auto-generate/{caregiverId}")
    public ResponseEntity<?> changeAutoGenerate(@PathVariable Integer caregiverId) {

        String result = summaryPreferenceService.changeAutoGenerate(caregiverId);

        if (result.equals("summary preference not found")) {
            return ResponseEntity.status(404).body(new ApiResponse(result));
        }

        return ResponseEntity.status(200).body(new ApiResponse(result));
    }


}