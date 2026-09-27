package com.example.yusr.Service;


import com.example.yusr.Model.Caregiver;
import com.example.yusr.Model.Medication;
import com.example.yusr.Model.Patient;
import com.example.yusr.Repository.CaregiverRepository;
import com.example.yusr.Repository.MedicationRepository;
import com.example.yusr.Repository.MedicationScheduleRepository;
import com.example.yusr.Repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MedicationService {
    private final MedicationRepository medicationRepository;
    private final PatientRepository patientRepository;
    private final MedicationScheduleRepository medicationScheduleRepository;
    private final CaregiverRepository caregiverRepository;
    private final WhatsAppService whatsAppService;


    public List<Medication>getMedications(){
        return medicationRepository.findAll();
    }

    public String addMedication(Medication medication){

        Patient checkPatient = patientRepository.findPatientById(medication.getPatientId());

        if (checkPatient == null){
            return "patient not found";
        }

        if (medication.getEndDate() != null && medication.getEndDate().isBefore(medication.getStartDate())){
            return "end date cannot be before start date";
        }

        medication.setStatus("active");

        medicationRepository.save(medication);
        return "added";
    }

    public String updateMedication(Integer id, Medication medication){

        Medication oldMedication =medicationRepository.findMedicationById(id);

        if (oldMedication == null){
            return "medication not found";
        }

        if (!oldMedication.getPatientId().equals(medication.getPatientId())){
            return "patient id cannot be changed";
        }

        if (medication.getEndDate() != null && medication.getEndDate().isBefore(medication.getStartDate())){
            return "end date cannot be before start date";
        }

        oldMedication.setName(medication.getName());
        oldMedication.setDosageValue(medication.getDosageValue());
        oldMedication.setDosageUnit(medication.getDosageUnit());
        oldMedication.setStockQuantity(medication.getStockQuantity());
        oldMedication.setLowStockLimit(medication.getLowStockLimit());
        oldMedication.setStartDate(medication.getStartDate());
        oldMedication.setEndDate(medication.getEndDate());

        medicationRepository.save(oldMedication);
        return "updated";
    }

    public String deleteMedication(Integer id){

        Medication medication = medicationRepository.findMedicationById(id);

        if (medication == null){
            return "medication not found";
        }

        Boolean hasSchedules = medicationScheduleRepository.existsMedicationScheduleByMedicationId(id);

        if (hasSchedules){
            return "medication has schedules";
        }

        medicationRepository.delete(medication);
        return "deleted";
    }


    public String discontinueMedication(Integer medicationId){

        Medication medication = medicationRepository.findMedicationById(medicationId);

        if (medication == null){
            return "medication not found";
        }

        if (medication.getStatus().equals("discontinued")){
            return "medication already discontinued";
        }

        medication.setStatus("discontinued");
        medication.setEndDate(LocalDate.now());

        medicationRepository.save(medication);

        return "discontinued";
    }

    public List<Medication> getMedicationWarnings(Integer patientId){

        Patient patient = patientRepository.findPatientById(patientId);

        if (patient == null){
            return null;
        }

        LocalDate today = LocalDate.now();
        LocalDate afterSevenDays = today.plusDays(7);

        return medicationRepository.getMedicationAlerts(patientId, today, afterSevenDays);
    }

    public List<Medication> getPatientMedications(Integer patientId){

        Patient patient = patientRepository.findPatientById(patientId);

        if (patient == null){
            return null;
        }

        return medicationRepository.findMedicationsByPatientId(patientId);
    }

    public String addMedicationStock(Integer medicationId, Integer quantity){

        Medication medication =
                medicationRepository.findMedicationById(medicationId);

        if (medication == null){
            return "medication not found";
        }

        if (quantity == null || quantity <= 0){
            return "quantity must be more than zero";
        }

        medication.setStockQuantity(
                medication.getStockQuantity() + quantity
        );

        medicationRepository.save(medication);

        return "stock added";
    }

    public String reactivateMedication(
            Integer medicationId,
            LocalDate startDate,
            LocalDate endDate){

        Medication medication =
                medicationRepository.findMedicationById(medicationId);

        if (medication == null){
            return "medication not found";
        }

        if (medication.getStatus().equals("active")){
            return "medication already active";
        }

        if (startDate != null){

            if (endDate != null && endDate.isBefore(startDate)){
                return "end date cannot be before start date";
            }

            medication.setStartDate(startDate);
            medication.setEndDate(endDate);
        }

        medication.setStatus("active");

        medicationRepository.save(medication);

        return "reactivated";
    }


}
