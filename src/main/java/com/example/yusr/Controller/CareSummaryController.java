package com.example.yusr.Controller;

import com.example.yusr.ApiResponse.ApiResponse;
import com.example.yusr.Model.CareSummary;
import com.example.yusr.Service.CareSummaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/care-summary")
@RequiredArgsConstructor
public class CareSummaryController {

    private final CareSummaryService careSummaryService;


    @GetMapping("/get-latest-summary/{caregiverId}")
    public ResponseEntity<?> getLatestSummary(@PathVariable Integer caregiverId) {

        CareSummary careSummary =
                careSummaryService.getLatestCareSummary(caregiverId);

        if (careSummary == null) {
            return ResponseEntity.status(404)
                    .body(new ApiResponse("care summary not found"));
        }

        return ResponseEntity.status(200).body(careSummary);
    }


    @PostMapping("/generate-on-demand/{caregiverId}")
    public ResponseEntity<?> generateOnDemandSummary(
            @PathVariable Integer caregiverId,
            @RequestParam LocalDate fromDate,
            @RequestParam LocalDate toDate) {

        String result =
                careSummaryService.generateOnDemandSummary(
                        caregiverId,
                        fromDate,
                        toDate
                );

        if (result.equals("caregiver not found")
                || result.equals("patient not found")) {
            return ResponseEntity.status(404)
                    .body(new ApiResponse(result));
        }

        if (result.equals("caregiver is not assigned to a patient") || result.equals("from date and to date cannot be null")
                || result.equals("from date cannot be after to date") || result.equals("to date cannot be in the future")) {
            return ResponseEntity.status(400).body(new ApiResponse(result));
        }

        if (result.equals("summary generated but email could not be sent")) {
            return ResponseEntity.status(500).body(new ApiResponse(result));
        }

        if (result.equals("AI service is temporarily unavailable")) {
            return ResponseEntity.status(503).body(new ApiResponse(result));
        }
        return ResponseEntity.status(200).body(new ApiResponse(result));
    }


    @PostMapping("/send-latest-summary-email/{caregiverId}")
    public ResponseEntity<?> sendLatestSummaryEmail(@PathVariable Integer caregiverId) {

        String result = careSummaryService.sendLatestSummaryEmail(caregiverId);

        if (result.equals("caregiver not found")
                || result.equals("patient not found") || result.equals("care summary not found")) {
            return ResponseEntity.status(404).body(new ApiResponse(result));
        }

        if (result.equals("caregiver is not assigned to a patient")) {
            return ResponseEntity.status(400).body(new ApiResponse(result));
        }

        if (result.equals("email could not be sent")) {
            return ResponseEntity.status(500).body(new ApiResponse(result));
        }

        return ResponseEntity.status(200).body(new ApiResponse(result));
    }
}