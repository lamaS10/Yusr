package com.example.yusr.Service;

import com.example.yusr.Model.Caregiver;
import com.example.yusr.Model.SummaryPreference;
import com.example.yusr.Repository.CaregiverRepository;
import com.example.yusr.Repository.SummaryPreferenceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class SummaryPreferenceService {

    private final SummaryPreferenceRepository summaryPreferenceRepository;
    private final CaregiverRepository caregiverRepository;


    public SummaryPreference getSummaryPreferenceByCaregiverId(Integer caregiverId) {
        return summaryPreferenceRepository.findSummaryPreferenceByCaregiverId(caregiverId);
    }


    public String addSummaryPreference(SummaryPreference summaryPreference) {

        Caregiver caregiver = caregiverRepository.findCaregiverById(summaryPreference.getCaregiverId());

        if (caregiver == null) {
            return "caregiver not found";
        }

        if (caregiver.getPatientId() == null) {
            return "caregiver is not assigned to a patient";
        }

        SummaryPreference checkPreference = summaryPreferenceRepository.findSummaryPreferenceByCaregiverId(summaryPreference.getCaregiverId());

        if (checkPreference != null) {
            return "summary preference already exists, you can update it";
        }

        summaryPreference.setLastGeneratedAt(null);

        if (summaryPreference.getAutoGenerate()) {
            summaryPreference.setNextGenerationAt(calculateNextGeneration(summaryPreference.getFrequency()));
        } else {
            summaryPreference.setNextGenerationAt(null);
        }

        summaryPreferenceRepository.save(summaryPreference);

        return "summary preference added successfully";
    }


    public String updateSummaryPreference(Integer id, SummaryPreference summaryPreference) {

        SummaryPreference oldPreference = summaryPreferenceRepository.findSummaryPreferenceById(id);

        if (oldPreference == null) {
            return "summary preference not found";
        }

        if (!oldPreference.getCaregiverId().equals(summaryPreference.getCaregiverId())) {
            return "caregiver id cannot be changed";
        }

        Caregiver caregiver = caregiverRepository.findCaregiverById(oldPreference.getCaregiverId());

        if (caregiver == null) {
            return "caregiver not found";
        }

        if (caregiver.getPatientId() == null) {
            return "caregiver is not assigned to a patient";
        }

        oldPreference.setFrequency(summaryPreference.getFrequency());
        oldPreference.setAutoGenerate(summaryPreference.getAutoGenerate());

        if (summaryPreference.getAutoGenerate()) {
            oldPreference.setNextGenerationAt(calculateNextGeneration(summaryPreference.getFrequency()));
        } else {
            oldPreference.setNextGenerationAt(null);
        }

        summaryPreferenceRepository.save(oldPreference);

        return "summary preference updated successfully";
    }


    public Boolean deleteSummaryPreference(Integer id) {

        SummaryPreference summaryPreference = summaryPreferenceRepository.findSummaryPreferenceById(id);

        if (summaryPreference == null) {
            return false;
        }

        summaryPreferenceRepository.delete(summaryPreference);

        return true;
    }


    private LocalDateTime calculateNextGeneration(String frequency) {

        LocalDateTime now = LocalDateTime.now();

        if (frequency.equals("daily")) {
            return now.plusDays(1);
        }

        if (frequency.equals("weekly")) {
            return now.plusWeeks(1);
        }

        return now.plusMonths(1);
    }

    public void updateAfterGeneration(Integer id) {

        SummaryPreference summaryPreference = summaryPreferenceRepository.findSummaryPreferenceById(id);

        if (summaryPreference == null) {
            return;
        }

        summaryPreference.setLastGeneratedAt(LocalDateTime.now());
        summaryPreference.setNextGenerationAt(calculateNextGeneration(summaryPreference.getFrequency()));

        summaryPreferenceRepository.save(summaryPreference);
    }

    public String changeAutoGenerate(Integer caregiverId) {

        SummaryPreference summaryPreference = summaryPreferenceRepository.findSummaryPreferenceByCaregiverId(caregiverId);

        if (summaryPreference == null) {
            return "summary preference not found";
        }

        if (summaryPreference.getAutoGenerate()) {
            summaryPreference.setAutoGenerate(false);
            summaryPreference.setNextGenerationAt(null);
            summaryPreferenceRepository.save(summaryPreference);
            return "automatic summary disabled";
        }

        summaryPreference.setAutoGenerate(true);
        summaryPreference.setNextGenerationAt(calculateNextGeneration(summaryPreference.getFrequency()));

        summaryPreferenceRepository.save(summaryPreference);
        return "automatic summary enabled";
    }
}