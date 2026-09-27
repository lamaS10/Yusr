package com.example.yusr.Service;


import com.example.yusr.Model.HealthReading;
import com.example.yusr.Model.Patient;
import com.example.yusr.Repository.HealthReadingRepository;
import com.example.yusr.Repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HealthReadingService {
    private final HealthReadingRepository healthReadingRepository;
    private final PatientRepository patientRepository;


    public List<HealthReading> getHealthReadings(){
        return healthReadingRepository.findAll();
    }


    public String addHealthReading(HealthReading healthReading){

        Patient patient = patientRepository.findPatientById(healthReading.getPatientId());

        if (patient == null){
            return "patient not found";
        }

        if (healthReading.getReadingType().equals("blood_pressure")){

            if (healthReading.getSystolicValue() == null || healthReading.getDiastolicValue() == null){
                return "blood pressure requires systolic and diastolic values";
            }

            if (healthReading.getReadingValue() != null){
                return "reading value must be empty for blood pressure";
            }

            healthReading.setGlucoseMeasurementType(null);
            healthReading.setUnit("mmHg");
        }

        if (!healthReading.getReadingType().equals("blood_pressure")){

            if (healthReading.getReadingValue() == null){
                return "reading value is required";
            }

            if (healthReading.getSystolicValue() != null || healthReading.getDiastolicValue() != null){
                return "systolic and diastolic values must be empty";
            }

            if (healthReading.getReadingType().equals("glucose")){

                if (healthReading.getGlucoseMeasurementType() == null){
                    return "glucose measurement type is required";
                }

                healthReading.setUnit("mg/dL");
            } else {
                healthReading.setGlucoseMeasurementType(null);
            }

            if (healthReading.getReadingType().equals("temperature")){
                healthReading.setUnit("C");
            }

            if (healthReading.getReadingType().equals("weight")){
                healthReading.setUnit("kg");
            }

            if (healthReading.getReadingType().equals("heart_rate")){
                healthReading.setUnit("bpm");
            }
        }

        if (healthReading.getMeasuredAt() == null){
            healthReading.setMeasuredAt(LocalDateTime.now());
        }

        healthReading.setRecordedAt(LocalDateTime.now());

        healthReading.setReadingStatus(classifyReading(healthReading));

        healthReadingRepository.save(healthReading);

        return "added";
    }

    public String updateHealthReading(Integer id, HealthReading healthReading){

        HealthReading oldHealthReading = healthReadingRepository.findHealthReadingById(id);

        if (oldHealthReading == null){
            return "health reading not found";
        }

        if (!oldHealthReading.getPatientId().equals(healthReading.getPatientId())){
            return "patient id cannot be changed";
        }

        if (healthReading.getReadingType().equals("blood_pressure")){

            if (healthReading.getSystolicValue() == null || healthReading.getDiastolicValue() == null){
                return "blood pressure requires systolic and diastolic values";
            }

            if (healthReading.getReadingValue() != null){
                return "reading value must be empty for blood pressure";
            }

            oldHealthReading.setUnit("mmHg");
            oldHealthReading.setGlucoseMeasurementType(null);
        }

        if (!healthReading.getReadingType().equals("blood_pressure")){

            if (healthReading.getReadingValue() == null){
                return "reading value is required";
            }

            if (healthReading.getSystolicValue() != null || healthReading.getDiastolicValue() != null){
                return "systolic and diastolic values must be empty";
            }

            if (healthReading.getReadingType().equals("glucose")){

                if (healthReading.getGlucoseMeasurementType() == null){
                    return "glucose measurement type is required";
                }

                oldHealthReading.setUnit("mg/dL");
                oldHealthReading.setGlucoseMeasurementType(healthReading.getGlucoseMeasurementType());

            } else {

                oldHealthReading.setGlucoseMeasurementType(null);
            }

            if (healthReading.getReadingType().equals("temperature")){
                oldHealthReading.setUnit("C");
            }

            if (healthReading.getReadingType().equals("weight")){
                oldHealthReading.setUnit("kg");
            }

            if (healthReading.getReadingType().equals("heart_rate")){
                oldHealthReading.setUnit("bpm");
            }
        }

        oldHealthReading.setReadingType(healthReading.getReadingType());
        oldHealthReading.setReadingValue(healthReading.getReadingValue());
        oldHealthReading.setSystolicValue(healthReading.getSystolicValue());
        oldHealthReading.setDiastolicValue(healthReading.getDiastolicValue());
        oldHealthReading.setNotes(healthReading.getNotes());

        if (healthReading.getMeasuredAt() != null){
            oldHealthReading.setMeasuredAt(healthReading.getMeasuredAt());
        }

        oldHealthReading.setReadingStatus(classifyReading(oldHealthReading));

        healthReadingRepository.save(oldHealthReading);

        return "updated";
    }

    public Boolean deleteHealthReading(Integer id){

        HealthReading healthReading = healthReadingRepository.findHealthReadingById(id);

        if (healthReading == null){
            return false;
        }

        healthReadingRepository.delete(healthReading);
        return true;
    }

    public List<HealthReading> getPatientHealthReadings(Integer patientId){

        Patient patient = patientRepository.findPatientById(patientId);

        if (patient == null){
            return null;
        }

        return healthReadingRepository.findHealthReadingsByPatientId(patientId);
    }

    public List<HealthReading> getLatestHealthReadings(Integer patientId){

        Patient patient = patientRepository.findPatientById(patientId);

        if (patient == null){
            return null;
        }

        List<HealthReading> latestReadings = new ArrayList<>();

        String[] readingTypes = {"blood_pressure", "glucose", "temperature", "weight", "heart_rate"};

        for (String readingType : readingTypes){

            HealthReading healthReading = healthReadingRepository.findTopByPatientIdAndReadingTypeOrderByMeasuredAtDesc(patientId, readingType);

            if (healthReading != null){
                latestReadings.add(healthReading);
            }
        }

        return latestReadings;
    }

    private String classifyReading(HealthReading healthReading){

        if (healthReading.getReadingType().equals("blood_pressure")){

            double systolic = healthReading.getSystolicValue();
            double diastolic = healthReading.getDiastolicValue();

            if (systolic > 180 || diastolic > 120){
                return "critical";
            }

            if (systolic >= 130 || diastolic >= 80){
                return "high";
            }

            if (systolic >= 120 && systolic <= 129 && diastolic < 80){
                return "elevated";
            }

            return "normal";
        }


        if (healthReading.getReadingType().equals("glucose")){

            double glucose = healthReading.getReadingValue();

            if (healthReading.getGlucoseMeasurementType().equals("fasting")){

                if (glucose < 70){
                    return "low";
                }

                if (glucose <= 130){
                    return "normal";
                }

                return "high";
            }


            if (healthReading.getGlucoseMeasurementType().equals("after_meal")){

                if (glucose < 70){
                    return "low";
                }

                if (glucose < 180){
                    return "normal";
                }

                return "high";
            }
        }


        return "not_classified";
    }

    public List<HealthReading> getAbnormalHealthReadings(Integer patientId){

        Patient patient = patientRepository.findPatientById(patientId);

        if (patient == null){
            return null;
        }

        List<HealthReading> healthReadings =
                healthReadingRepository.findHealthReadingsByPatientId(patientId);

        List<HealthReading> abnormalReadings = new ArrayList<>();

        for (HealthReading healthReading : healthReadings){

            if (healthReading.getReadingStatus().equals("elevated") || healthReading.getReadingStatus().equals("low")
                    || healthReading.getReadingStatus().equals("high") || healthReading.getReadingStatus().equals("critical")){

                abnormalReadings.add(healthReading);
            }
        }

        return abnormalReadings;
    }
}
