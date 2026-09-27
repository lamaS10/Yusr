package com.example.yusr.Controller;


import com.example.yusr.ApiResponse.ApiResponse;
import com.example.yusr.Model.Incident;
import com.example.yusr.Service.IncidentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.Errors;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/incident")
@RequiredArgsConstructor
public class IncidentController {

    private final IncidentService incidentService;

    @GetMapping("/get-incidents")
    public ResponseEntity<?>getIncidents(){
        return ResponseEntity.status(200).body(incidentService.getIncidents());
    }

    @PostMapping("/add-incident")
    public ResponseEntity<?>addIncident(@RequestBody @Valid Incident incident, Errors errors){
        if (errors.hasErrors()){
            String message=errors.getFieldError().getDefaultMessage();
            return ResponseEntity.status(400).body(message);
        }
        Boolean isAdded=incidentService.addIncident(incident);
        if (isAdded){
            return ResponseEntity.status(200).body(new ApiResponse("incident is added successfully"));
        }
        return ResponseEntity.status(404).body(new ApiResponse("didn't find patient"));
    }


    @PutMapping("/update-incident/{id}")
    public ResponseEntity<?>updateIncident(@PathVariable Integer id,@RequestBody @Valid Incident incident, Errors errors){
        if (errors.hasErrors()){
            String message=errors.getFieldError().getDefaultMessage();
            return ResponseEntity.status(400).body(message);
        }
        String checkUpdate=incidentService.updateIncident(id, incident);

        if (checkUpdate.equals("incident not found")){
            return ResponseEntity.status(404).body(new ApiResponse("didn't find the incident"));
        }
        if (checkUpdate.equals("patient id cannot be changed")){
            return ResponseEntity.status(400).body(new ApiResponse("patient id cannot be changed"));
        }

        return ResponseEntity.status(200).body(new ApiResponse("incident is updated successfully"));
    }


    @DeleteMapping("/delete-incident/{id}")
    public ResponseEntity<?>deleteIncident(@PathVariable Integer id){
        Boolean isDeleted=incidentService.deleteIncident(id);
        if (isDeleted){
            return ResponseEntity.status(200).body(new ApiResponse("incident is deleted successfully"));
        }
        return ResponseEntity.status(404).body(new ApiResponse("didn't find the incident"));

    }

    @PutMapping("/start-monitoring-incident/{id}")
    public ResponseEntity<?> startMonitoringIncident(@PathVariable Integer id){

        String checkMonitoring =
                incidentService.startMonitoringIncident(id);

        if (checkMonitoring.equals("incident not found")){
            return ResponseEntity.status(404).body(new ApiResponse("didn't find the incident"));
        }

        if (checkMonitoring.equals("incident already under monitoring")){
            return ResponseEntity.status(400).body(new ApiResponse("incident already under monitoring"));
        }

        if (checkMonitoring.equals("resolved incident cannot be monitored")){
            return ResponseEntity.status(400).body(new ApiResponse("resolved incident cannot be monitored"));
        }

        return ResponseEntity.status(200).body(new ApiResponse("incident is under monitoring successfully"));
    }

    @PutMapping("/resolve-incident/{id}")
    public ResponseEntity<?> resolveIncident(@PathVariable Integer id, @RequestParam(required = false) LocalDateTime resolvedAt){

        String checkResolve = incidentService.resolveIncident(id, resolvedAt);

        if (checkResolve.equals("incident not found")){
            return ResponseEntity.status(404).body(new ApiResponse("didn't find the incident"));
        }

        if (checkResolve.equals("incident already resolved")){
            return ResponseEntity.status(400).body(new ApiResponse("incident already resolved"));
        }

        if (checkResolve.equals("resolved time cannot be in the future")){
            return ResponseEntity.status(400).body(new ApiResponse("resolved time cannot be in the future"));
        }

        if (checkResolve.equals("resolved time cannot be before incident time")){
            return ResponseEntity.status(400).body(new ApiResponse("resolved time cannot be before incident time"));
        }

        return ResponseEntity.status(200).body(new ApiResponse("incident is resolved successfully"));
    }

    @GetMapping("/get-patient-incidents/{patientId}")
    public ResponseEntity<?> getPatientIncidents(@PathVariable Integer patientId){

        List<Incident> incidents = incidentService.getPatientIncidents(patientId);

        if (incidents == null){
            return ResponseEntity.status(404).body(new ApiResponse("patient not found"));
        }

        if (incidents.isEmpty()){
            return ResponseEntity.status(200).body(new ApiResponse("patient has no incidents"));
        }

        return ResponseEntity.status(200).body(incidents);
    }
}
