package com.example.yusr.Controller;


import com.example.yusr.ApiResponse.ApiResponse;
import com.example.yusr.Model.ChronicCondition;
import com.example.yusr.Service.ChronicConditionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.Errors;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/v1/chronic-condition")
@RequiredArgsConstructor
public class ChronicConditionController {

    private final ChronicConditionService chronicConditionService;

    @GetMapping("/get-chronic-conditions")
    public ResponseEntity<?>getChronicConditions(){
        return ResponseEntity.status(200).body(chronicConditionService.getChronicConditions());
    }

    @PostMapping("/add-chronic-condition")
    public ResponseEntity<?>addChronicCondition(@RequestBody @Valid ChronicCondition chronicCondition, Errors errors){
        if (errors.hasErrors()){
            String message=errors.getFieldError().getDefaultMessage();
            return ResponseEntity.status(400).body(message);
        }
        Boolean isAdded=chronicConditionService.addChronicCondition(chronicCondition);
        if (isAdded){
            return ResponseEntity.status(200).body(new ApiResponse("Chronic Condition is added successfully"));
        }
        return ResponseEntity.status(400).body(new ApiResponse("didn't find patient with requested id"));
    }


    @PutMapping("/update-chronic-condition/{id}")
    public ResponseEntity<?>updateChronicCondition(@PathVariable Integer id,@RequestBody @Valid ChronicCondition chronicCondition, Errors errors){
        if (errors.hasErrors()){
            String message=errors.getFieldError().getDefaultMessage();
            return ResponseEntity.status(400).body(message);
        }

        String checkUpdate =chronicConditionService.updateChronicCondition(id, chronicCondition);

        if (checkUpdate.equals("chronic condition not found")){
            return ResponseEntity.status(404).body(new ApiResponse("didn't find Chronic Condition with requested id"));
        }

        if (checkUpdate.equals("patient id cannot be changed")){
            return ResponseEntity.status(400).body(new ApiResponse("patient id cannot be changed"));
        }

        return ResponseEntity.status(200).body(new ApiResponse("Chronic Condition is updated successfully"));

    }

    @DeleteMapping("/delete-chronic-condition/{id}")
    public ResponseEntity<?>deleteChronicCondition(@PathVariable Integer id){
        Boolean isDeleted=chronicConditionService.deleteChronicCondition(id);
        if (isDeleted){
            return ResponseEntity.status(200).body(new ApiResponse("Chronic Condition is deleted successfully"));
        }
        return ResponseEntity.status(404).body(new ApiResponse("didn't find Chronic Condition with requested id"));

    }

}
