package com.example.yusr.Controller;


import com.example.yusr.ApiResponse.ApiResponse;
import com.example.yusr.Model.CareTask;
import com.example.yusr.Service.CareTaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.Errors;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/care-task")
@RequiredArgsConstructor
public class CareTaskController {

    private final CareTaskService careTaskService;


    @GetMapping("/get-care-task")
    public ResponseEntity<?>getCareTasks(){
        return ResponseEntity.status(200).body(careTaskService.getCareTasks());
    }


    @PostMapping("/add-care-task")
    public ResponseEntity<?>addCareTask(@RequestBody @Valid CareTask careTask, Errors errors){
        if (errors.hasErrors()){
            String message=errors.getFieldError().getDefaultMessage();
            return ResponseEntity.status(400).body(message);
        }
        String checkAdd=careTaskService.addCareTask(careTask);

        if (checkAdd.equals("patient not found")){
            return ResponseEntity.status(404).body(new ApiResponse("didn't find patient"));
        }

        if (checkAdd.equals("caregiver not found")){
            return ResponseEntity.status(404).body(new ApiResponse("didn't find caregiver"));
        }

        if (checkAdd.equals("caregiver does not belong to patient")){
            return ResponseEntity.status(400).body(new ApiResponse("caregiver does not belong to patient"));
        }

        return ResponseEntity.status(200).body(new ApiResponse("care task added is successfully"));
    }


    @PutMapping("/update-care-task/{id}")
    public ResponseEntity<?>updateCareTask(@PathVariable Integer id,@RequestBody @Valid CareTask careTask, Errors errors){
        if (errors.hasErrors()){
            String message=errors.getFieldError().getDefaultMessage();
            return ResponseEntity.status(400).body(message);
        }

        String checkUpdate=careTaskService.updateCareTask(id, careTask);

        if (checkUpdate.equals("care task not found")){
            return ResponseEntity.status(404).body(new ApiResponse("didn't find care task"));
        }
        if (checkUpdate.equals("patient id cannot be changed")){
            return ResponseEntity.status(400).body(new ApiResponse("patient id cannot be changed"));
        }

        if (checkUpdate.equals("caregiver id cannot be changed")){
            return ResponseEntity.status(400).body(new ApiResponse("caregiver id cannot be changed"));
        }

        return ResponseEntity.status(200).body(new ApiResponse("care task is updated successfully"));
    }


    @DeleteMapping("/delete-care-task/{id}")
    public ResponseEntity<?>deleteCareTask(@PathVariable Integer id){
        Boolean isDeleted=careTaskService.deleteCareTask(id);
        if (isDeleted){
            return ResponseEntity.status(200).body(new ApiResponse("care task is deleted successfully"));
        }
        return ResponseEntity.status(404).body(new ApiResponse("didn't find care task"));


    }

    @PutMapping("/complete-care-task/{id}")
    public ResponseEntity<?> completeCareTask(@PathVariable Integer id, @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime completedAt){

        String checkComplete = careTaskService.completeCareTask(id, completedAt);

        if (checkComplete.equals("care task not found")){
            return ResponseEntity.status(404).body(new ApiResponse("didn't find care task"));
        }

        if (checkComplete.equals("care task already completed")){
            return ResponseEntity.status(400).body(new ApiResponse("care task already completed"));
        }

        if (checkComplete.equals("cancelled care task cannot be completed")){
            return ResponseEntity.status(400).body(new ApiResponse("cancelled care task cannot be completed"));
        }

        if (checkComplete.equals("completed time cannot be in the future")){
            return ResponseEntity.status(400).body(new ApiResponse("completed time cannot be in the future"));
        }
        if (checkComplete.equals("care task cannot be completed before due date")){
            return ResponseEntity.status(400).body(new ApiResponse("care task cannot be completed before due date"));
        }
        return ResponseEntity.status(200).body(new ApiResponse("care task is completed successfully"));
    }

    @PutMapping("/cancel-care-task/{id}")
    public ResponseEntity<?> cancelCareTask(@PathVariable Integer id){

        String checkCancel = careTaskService.cancelCareTask(id);

        if (checkCancel.equals("care task not found")){
            return ResponseEntity.status(404).body(new ApiResponse("didn't find care task"));
        }

        if (checkCancel.equals("care task already cancelled")){
            return ResponseEntity.status(400).body(new ApiResponse("care task already cancelled"));
        }

        if (checkCancel.equals("completed care task cannot be cancelled")){
            return ResponseEntity.status(400).body(new ApiResponse("completed care task cannot be cancelled"));
        }

        return ResponseEntity.status(200).body(new ApiResponse("care task is cancelled successfully"));
    }

    @GetMapping("/get-patient-care-tasks/{patientId}")
    public ResponseEntity<?> getPatientCareTasks(@PathVariable Integer patientId){

        List<CareTask> careTasks = careTaskService.getPatientCareTasks(patientId);

        if (careTasks == null){
            return ResponseEntity.status(404).body(new ApiResponse("patient not found"));
        }

        if (careTasks.isEmpty()){
            return ResponseEntity.status(200).body(new ApiResponse("patient has no care tasks"));
        }

        return ResponseEntity.status(200).body(careTasks);
    }


}
