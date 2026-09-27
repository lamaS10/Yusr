package com.example.yusr.Controller;


import com.example.yusr.ApiResponse.ApiResponse;
import com.example.yusr.Model.Caregiver;
import com.example.yusr.Model.CaregiverInvitation;
import com.example.yusr.Service.CaregiverService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.Errors;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/caregiver")
@RequiredArgsConstructor
public class CaregiverController {

    private final CaregiverService caregiverService;

    @GetMapping("/get-caregivers")
    public ResponseEntity<?>getCaregiver(){
        return ResponseEntity.status(200).body(caregiverService.getCaregivers());
    }

    @PostMapping("/add-caregiver")
    public ResponseEntity<?>addCaregiver(@RequestBody @Valid Caregiver caregiver, Errors errors){
        if (errors.hasErrors()){
            String message=errors.getFieldError().getDefaultMessage();
            return ResponseEntity.status(400).body(message);
        }

        String checkAdded=caregiverService.addCaregiver(caregiver);

        if (checkAdded.equals("email already exists")){
            return ResponseEntity.status(400).body(new ApiResponse("email already exists,please enter another email"));
        }
        if (checkAdded.equals("phone number already exists")){
            return ResponseEntity.status(400).body(new ApiResponse("phone number already exists,please enter another phone number"));
        }
        if (checkAdded.equals("added and assigned")){
            return ResponseEntity.status(200).body(new ApiResponse("the caregiver is registered and assigned to the patient successfully"));
        }

        return ResponseEntity.status(200).body(new ApiResponse("the caregiver is added successfully"));
    }


    @PutMapping("/update-caregiver/{id}")
    public ResponseEntity<?>updateCaregiver(@PathVariable Integer id,@RequestBody @Valid Caregiver caregiver, Errors errors){
        if (errors.hasErrors()){
            String message=errors.getFieldError().getDefaultMessage();
            return ResponseEntity.status(400).body(message);
        }

        String checkUpdate = caregiverService.updateCaregiver(id, caregiver);

        if (checkUpdate.equals("caregiver not found")){
            return ResponseEntity.status(404).body(new ApiResponse("didn't find caregiver with requested id"));
        }

        if (checkUpdate.equals("email already exists")){
            return ResponseEntity.status(400).body(new ApiResponse("email already exists"));
        }

        if (checkUpdate.equals("phone number already exists")){
            return ResponseEntity.status(400).body(new ApiResponse("phone number already exists"));
        }

        return ResponseEntity.status(200).body(new ApiResponse("the caregiver with id: " + id + " is updated successfully"));
    }


    @DeleteMapping("/delete-caregiver/{id}")
    public ResponseEntity<?> deleteCaregiver(@PathVariable Integer id){

        String result = caregiverService.deleteCaregiver(id);

        if (result.equals("caregiver not found")){
            return ResponseEntity.status(404).body(new ApiResponse("didn't find caregiver with requested id"));
        }

        if (result.equals("caregiver is assigned to a patient")){
            return ResponseEntity.status(400).body(new ApiResponse("caregiver must leave the patient before deleting the account"));
        }

        return ResponseEntity.status(200).body(new ApiResponse("the caregiver with id: " + id + " is deleted successfully"));
    }

    // Sends an invitation to add a caregiver to the patient
    @PostMapping("/assign-caregiver-to-patient/{primaryCaregiverId}/{patientId}")
    public ResponseEntity<?> assignCaregiverToPatient(@PathVariable Integer primaryCaregiverId, @PathVariable Integer patientId, @RequestParam String email, @RequestParam String phoneNumber) {

        String result = caregiverService.assignCaregiverToPatient(primaryCaregiverId, patientId, email, phoneNumber);

        if (result.equals("primary caregiver not found")) {
            return ResponseEntity.status(404).body(new ApiResponse("primary caregiver not found"));
        }

        if (result.equals("patient not found")) {
            return ResponseEntity.status(404).body(new ApiResponse("patient not found"));
        }

        if (result.equals("caregiver does not belong to this patient")) {
            return ResponseEntity.status(400).body(new ApiResponse("caregiver does not belong to this patient"));
        }

        if (result.equals("only primary caregiver can add another caregiver")) {
            return ResponseEntity.status(400).body(new ApiResponse("only primary caregiver can add another caregiver"));
        }


        if (result.equals("caregiver already assigned to a patient")) {
            return ResponseEntity.status(400).body(new ApiResponse("caregiver already assigned to a patient"));
        }

        if (result.equals("caregiver already has a pending invitation")) {
            return ResponseEntity.status(400).body(new ApiResponse("caregiver already has a pending invitation"));
        }

        return ResponseEntity.status(200).body(new ApiResponse("caregiver invitation sent successfully"));
    }


    // Checks the caregiver's latest WhatsApp response
    @PostMapping("/check-caregiver-invitation-response")
    public ResponseEntity<?> checkCaregiverInvitationResponse(@RequestParam String phoneNumber) {

        String result = caregiverService.checkCaregiverInvitationResponse(phoneNumber);

        if (result.equals("no response found")) {
            return ResponseEntity.status(404).body(new ApiResponse("no WhatsApp response found"));
        }

        if (result.equals("caregiver has not responded to the invitation")) {
            return ResponseEntity.status(400).body(new ApiResponse("caregiver has not responded to the invitation"));
        }

        if (result.equals("pending invitation not found")) {
            return ResponseEntity.status(404).body(new ApiResponse("pending invitation not found"));
        }

        if (result.equals("caregiver already assigned to a patient")) {
            return ResponseEntity.status(400).body(new ApiResponse("caregiver already assigned to a patient"));
        }

        return ResponseEntity.status(200).body(new ApiResponse(result));
    }

    // Unlinks a secondary or backup caregiver from the patient
    @PutMapping("/unlink-caregiver/{primaryCaregiverId}/{caregiverId}")
    public ResponseEntity<?> unlinkCaregiverFromPatient(@PathVariable Integer primaryCaregiverId, @PathVariable Integer caregiverId) {

        String result = caregiverService.unlinkCaregiverFromPatient(primaryCaregiverId, caregiverId);

        if (result.equals("primary caregiver not found")) {
            return ResponseEntity.status(404).body(new ApiResponse("primary caregiver not found"));
        }

        if (result.equals("caregiver not found")) {
            return ResponseEntity.status(404).body(new ApiResponse("caregiver not found"));
        }

        if (result.equals("primary caregiver is not assigned to a patient")) {
            return ResponseEntity.status(400).body(new ApiResponse("primary caregiver is not assigned to a patient"));
        }
        if (result.equals("only primary caregiver can unlink caregiver")) {
            return ResponseEntity.status(400).body(new ApiResponse("only primary caregiver can unlink caregiver"));
        }

        if (result.equals("caregiver is not assigned to a patient")) {
            return ResponseEntity.status(400).body(new ApiResponse("caregiver is not assigned to a patient"));
        }

        if (result.equals("caregivers do not belong to the same patient")) {
            return ResponseEntity.status(400).body(new ApiResponse("caregivers do not belong to the same patient"));
        }

        if (result.equals("primary caregiver cannot be unlinked")) {
            return ResponseEntity.status(400).body(new ApiResponse("primary caregiver cannot be unlinked"));
        }

        return ResponseEntity.status(200).body(new ApiResponse("caregiver unlinked successfully"));
    }

    @GetMapping("/get-patient-caregivers/{patientId}")
    public ResponseEntity<?> getPatientCaregivers(@PathVariable Integer patientId){

        List<Caregiver> caregivers = caregiverService.getPatientCaregivers(patientId);

        if (caregivers == null){
            return ResponseEntity.status(404).body(new ApiResponse("patient not found"));
        }

        if (caregivers.isEmpty()){
            return ResponseEntity.status(404).body(new ApiResponse("patient has no caregivers"));
        }

        return ResponseEntity.status(200).body(caregivers);
    }

    @PutMapping("/transfer-primary-role/{primaryCaregiverId}/{newPrimaryCaregiverId}")
    public ResponseEntity<?> transferPrimaryRole(@PathVariable Integer primaryCaregiverId, @PathVariable Integer newPrimaryCaregiverId){

        String result = caregiverService.transferPrimaryRole(primaryCaregiverId, newPrimaryCaregiverId);

        if (result.equals("primary caregiver not found") || result.equals("new primary caregiver not found")){
            return ResponseEntity.status(404).body(new ApiResponse(result));
        }

        if (!result.equals("primary role transferred successfully")){
            return ResponseEntity.status(400).body(new ApiResponse(result));
        }

        return ResponseEntity.status(200).body(new ApiResponse(result));
    }

    @PutMapping("/leave-patient/{caregiverId}")
    public ResponseEntity<?> leavePatient(@PathVariable Integer caregiverId, @RequestParam(required = false) Integer newPrimaryCaregiverId){

        String result = caregiverService.leavePatient(caregiverId, newPrimaryCaregiverId);

        if (result.equals("caregiver not found") || result.equals("patient not found") || result.equals("new primary caregiver not found")){
            return ResponseEntity.status(404).body(new ApiResponse(result));
        }

        if (result.equals("caregiver is not assigned to a patient") || result.equals("new primary caregiver is required") ||
                result.equals("new primary caregiver does not belong to this patient") || result.equals("new primary caregiver must be secondary or backup") || result.equals("primary caregiver not found")){
            return ResponseEntity.status(400).body(new ApiResponse(result));
        }

        return ResponseEntity.status(200).body(new ApiResponse(result));
    }

    @GetMapping("/get-pending-caregiver-invitation/{caregiverId}")
    public ResponseEntity<?> getPendingCaregiverInvitation(@PathVariable Integer caregiverId){

        CaregiverInvitation invitation = caregiverService.getPendingCaregiverInvitation(caregiverId);

        if (invitation == null){
            return ResponseEntity.status(404).body(new ApiResponse("no pending invitation found"));
        }

        return ResponseEntity.status(200).body(invitation);
    }


    @PutMapping("/accept-caregiver-invitation/{invitationId}/{caregiverId}")
    public ResponseEntity<?> acceptCaregiverInvitation(@PathVariable Integer invitationId, @PathVariable Integer caregiverId){

        String checkAccept = caregiverService.acceptCaregiverInvitation(invitationId, caregiverId);

        if (checkAccept.equals("invitation not found")){
            return ResponseEntity.status(404).body(new ApiResponse("invitation not found"));
        }

        if (checkAccept.equals("caregiver not found")){
            return ResponseEntity.status(404).body(new ApiResponse("caregiver not found"));
        }

        if (checkAccept.equals("invitation is not pending")){
            return ResponseEntity.status(400).body(new ApiResponse("invitation is not pending"));
        }

        if (checkAccept.equals("invitation does not belong to caregiver")){
            return ResponseEntity.status(400).body(new ApiResponse("invitation does not belong to caregiver"));
        }

        if (checkAccept.equals("caregiver already assigned to a patient")){
            return ResponseEntity.status(400).body(new ApiResponse("caregiver already assigned to a patient"));
        }

        if (checkAccept.equals("patient not found")){
            return ResponseEntity.status(404).body(new ApiResponse("patient not found"));
        }

        return ResponseEntity.status(200).body(new ApiResponse("invitation accepted and caregiver assigned successfully"));
    }


    @PutMapping("/reject-caregiver-invitation/{invitationId}/{caregiverId}")
    public ResponseEntity<?> rejectCaregiverInvitation(@PathVariable Integer invitationId, @PathVariable Integer caregiverId){

        String checkReject = caregiverService.rejectCaregiverInvitation(invitationId, caregiverId);

        if (checkReject.equals("invitation not found")){
            return ResponseEntity.status(404).body(new ApiResponse("invitation not found"));
        }

        if (checkReject.equals("caregiver not found")){
            return ResponseEntity.status(404).body(new ApiResponse("caregiver not found"));
        }

        if (checkReject.equals("invitation is not pending")){
            return ResponseEntity.status(400).body(new ApiResponse("invitation is not pending"));
        }

        if (checkReject.equals("invitation does not belong to caregiver")){
            return ResponseEntity.status(400).body(new ApiResponse("invitation does not belong to caregiver"));
        }

        return ResponseEntity.status(200).body(new ApiResponse("invitation rejected successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestParam String email, @RequestParam String password){

        Caregiver caregiver = caregiverService.login(email, password);

        if (caregiver == null){
            return ResponseEntity.status(400).body(new ApiResponse("email or password is incorrect"));
        }

        return ResponseEntity.status(200).body(caregiver);
    }

    @GetMapping("/get-caregiver/{id}")
    public ResponseEntity<?> getCaregiverById(@PathVariable Integer id){

        Caregiver caregiver = caregiverService.getCaregiverById(id);

        if (caregiver == null){
            return ResponseEntity.status(404)
                    .body(new ApiResponse("caregiver not found"));
        }

        return ResponseEntity.status(200).body(caregiver);
    }

    @GetMapping("/get-pending-patient-invitations/{patientId}")
    public ResponseEntity<?> getPendingPatientInvitations(@PathVariable Integer patientId) {

        List<CaregiverInvitation> invitations = caregiverService.getPendingPatientInvitations(patientId);

        if (invitations == null) {
            return ResponseEntity.status(404).body(new ApiResponse("patient not found"));
        }

        return ResponseEntity.status(200).body(invitations);
    }

    @PutMapping("/cancel-caregiver-invitation/{invitationId}/{primaryCaregiverId}")
    public ResponseEntity<?> cancelCaregiverInvitation(@PathVariable Integer invitationId, @PathVariable Integer primaryCaregiverId) {

        String result = caregiverService.cancelCaregiverInvitation(invitationId, primaryCaregiverId);

        if (result.equals("primary caregiver not found") || result.equals("invitation not found")) {

            return ResponseEntity.status(404).body(new ApiResponse(result));
        }

        if (!result.equals("invitation cancelled")) {

            return ResponseEntity.status(400).body(new ApiResponse(result));
        }

        return ResponseEntity.status(200).body(new ApiResponse("invitation cancelled successfully"));
    }
}
