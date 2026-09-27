package com.example.yusr.Controller;


import com.example.yusr.ApiResponse.ApiResponse;
import com.example.yusr.Model.Handover;
import com.example.yusr.Service.HandoverService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.Errors;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/handover")
@RequiredArgsConstructor
public class HandoverController {

    private final HandoverService handoverService;

    @GetMapping("/get-handovers")
    public ResponseEntity<?> getHandovers(){
        return ResponseEntity.status(200).body(handoverService.getHandovers());
    }

    @PostMapping("/add-handover")
    public ResponseEntity<?> addHandover(@RequestBody @Valid Handover handover, Errors errors){
        if (errors.hasErrors()){
            String message = errors.getFieldError().getDefaultMessage();
            return ResponseEntity.status(400).body(message);
        }

        String checkAdd = handoverService.addHandover(handover);

        if (checkAdd.equals("patient not found") || checkAdd.equals("caregiver not found")){
            return ResponseEntity.status(404).body(new ApiResponse(checkAdd));
        }

        if (!checkAdd.equals("added")){
            return ResponseEntity.status(400).body(new ApiResponse(checkAdd));
        }

        return ResponseEntity.status(200).body(new ApiResponse("handover is added successfully"));
    }

    @PutMapping("/update-handover/{id}")
    public ResponseEntity<?> updateHandover(@PathVariable Integer id, @RequestBody @Valid Handover handover, Errors errors){
        if (errors.hasErrors()){
            String message = errors.getFieldError().getDefaultMessage();
            return ResponseEntity.status(400).body(message);
        }

        String checkUpdate = handoverService.updateHandover(id, handover);

        if (checkUpdate.equals("handover not found")){
            return ResponseEntity.status(404).body(new ApiResponse(checkUpdate));
        }

        if (!checkUpdate.equals("updated")){
            return ResponseEntity.status(400).body(new ApiResponse(checkUpdate));
        }

        return ResponseEntity.status(200).body(new ApiResponse("handover is updated successfully"));
    }

    @DeleteMapping("/delete-handover/{id}")
    public ResponseEntity<?> deleteHandover(@PathVariable Integer id){

        String result = handoverService.deleteHandover(id);

        if (result.equals("handover not found")){
            return ResponseEntity.status(404).body(new ApiResponse(result));
        }

        if (result.equals("accepted handover cannot be deleted")){
            return ResponseEntity.status(400).body(new ApiResponse(result));
        }

        return ResponseEntity.status(200).body(new ApiResponse("handover is deleted successfully"));
    }

    @PutMapping("/accept-handover/{handoverId}/{caregiverId}")
    public ResponseEntity<?> acceptHandover(@PathVariable Integer handoverId,
                                            @PathVariable Integer caregiverId){

        String result = handoverService.acceptHandover(handoverId, caregiverId);

        if (result.equals("handover not found") || result.equals("caregiver not found")){
            return ResponseEntity.status(404).body(new ApiResponse(result));
        }

        if (!result.equals("accepted")){
            return ResponseEntity.status(400).body(new ApiResponse(result));
        }

        return ResponseEntity.status(200)
                .body(new ApiResponse("handover is accepted successfully"));
    }


    @PutMapping("/reject-handover/{handoverId}/{caregiverId}")
    public ResponseEntity<?> rejectHandover(@PathVariable Integer handoverId,
                                            @PathVariable Integer caregiverId){

        String result = handoverService.rejectHandover(handoverId, caregiverId);

        if (result.equals("handover not found") || result.equals("caregiver not found")){
            return ResponseEntity.status(404).body(new ApiResponse(result));
        }

        if (!result.equals("rejected")){
            return ResponseEntity.status(400).body(new ApiResponse(result));
        }

        return ResponseEntity.status(200).body(new ApiResponse("handover is rejected successfully"));
    }

    @GetMapping("/get-pending-handover/{caregiverId}")
    public ResponseEntity<?> getPendingHandover(@PathVariable Integer caregiverId){

        Handover handover = handoverService.getPendingHandover(caregiverId);

        if (handover == null){
            return ResponseEntity.status(404).body(new ApiResponse("pending handover not found"));
        }

        return ResponseEntity.status(200).body(handover);
    }


    @GetMapping("/get-sent-handovers/{caregiverId}")
    public ResponseEntity<?> getSentHandovers(@PathVariable Integer caregiverId){

        List<Handover> handovers = handoverService.getSentHandovers(caregiverId);

        if (handovers == null){
            return ResponseEntity.status(404).body(new ApiResponse("caregiver not found"));
        }

        if (handovers.isEmpty()){
            return ResponseEntity.status(200).body(new ApiResponse("caregiver has no sent handovers"));
        }

        return ResponseEntity.status(200).body(handovers);
    }
}
