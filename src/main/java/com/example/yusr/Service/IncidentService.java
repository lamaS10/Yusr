package com.example.yusr.Service;


import com.example.yusr.Model.Caregiver;
import com.example.yusr.Model.Incident;
import com.example.yusr.Model.Patient;
import com.example.yusr.Repository.CaregiverRepository;
import com.example.yusr.Repository.IncidentRepository;
import com.example.yusr.Repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class IncidentService {

    private final IncidentRepository incidentRepository;
    private final PatientRepository patientRepository;
    private final CaregiverRepository caregiverRepository;
    private final WhatsAppService whatsAppService;

    public List<Incident> getIncidents(){
        return incidentRepository.findAll();
    }


    public Boolean addIncident(Incident incident){

        Patient patient = patientRepository.findPatientById(incident.getPatientId());

        if (patient == null){
            return false;
        }

        if (incident.getIncidentAt() == null){
            incident.setIncidentAt(LocalDateTime.now());
        }

        incident.setRecordedAt(LocalDateTime.now());
        incident.setStatus("open");
        incident.setResolvedAt(null);

        incidentRepository.save(incident);

        if (incident.getSeverity().equals("high") || incident.getSeverity().equals("critical")){
            sendIncidentAlert(incident);
        }

        return true;
    }

    public String updateIncident(Integer id, Incident incident){

        Incident oldIncident = incidentRepository.findIncidentById(id);

        if (oldIncident == null){
            return "incident not found";
        }

        if (!oldIncident.getPatientId().equals(incident.getPatientId())){
            return "patient id cannot be changed";
        }

        String oldSeverity = oldIncident.getSeverity();

        oldIncident.setIncidentType(incident.getIncidentType());
        oldIncident.setDescription(incident.getDescription());
        oldIncident.setSeverity(incident.getSeverity());
        oldIncident.setActionTaken(incident.getActionTaken());

        incidentRepository.save(oldIncident);

        if ((oldSeverity.equals("low") || oldSeverity.equals("medium"))
                && (incident.getSeverity().equals("high") || incident.getSeverity().equals("critical"))){
            sendIncidentAlert(oldIncident);
        }

        return "updated";
    }

    public Boolean deleteIncident(Integer id){

        Incident incident = incidentRepository.findIncidentById(id);

        if (incident == null){
            return false;
        }

        incidentRepository.delete(incident);
        return true;
    }

    public String startMonitoringIncident(Integer id){

        Incident incident = incidentRepository.findIncidentById(id);

        if (incident == null){
            return "incident not found";
        }

        if (incident.getStatus().equals("monitoring")){
            return "incident already under monitoring";
        }

        if (incident.getStatus().equals("resolved")){
            return "resolved incident cannot be monitored";
        }

        incident.setStatus("monitoring");

        incidentRepository.save(incident);

        return "monitoring";
    }

    public String resolveIncident(Integer id, LocalDateTime resolvedAt){

        Incident incident = incidentRepository.findIncidentById(id);

        if (incident == null){
            return "incident not found";
        }

        if (incident.getStatus().equals("resolved")){
            return "incident already resolved";
        }

        if (resolvedAt == null){
            resolvedAt = LocalDateTime.now();
        }

        if (resolvedAt.isAfter(LocalDateTime.now())){
            return "resolved time cannot be in the future";
        }

        if (resolvedAt.isBefore(incident.getIncidentAt())){
            return "resolved time cannot be before incident time";
        }

        incident.setStatus("resolved");
        incident.setResolvedAt(resolvedAt);

        incidentRepository.save(incident);

        if (incident.getSeverity().equals("high") || incident.getSeverity().equals("critical")){
            sendResolvedIncidentAlert(incident);
        }

        return "resolved";
    }

    public List<Incident> getPatientIncidents(Integer patientId){

        Patient patient = patientRepository.findPatientById(patientId);

        if (patient == null){
            return null;
        }

        return incidentRepository.findIncidentsByPatientId(patientId);
    }

    private String translateIncidentType(String incidentType){

        return switch (incidentType){
            case "fall" -> "سقوط";
            case "medication_error" -> "خطأ دوائي";
            case "health_change" -> "تغير في الحالة الصحية";
            case "injury" -> "إصابة";
            case "other" -> "حادث آخر";
            default -> incidentType;
        };
    }


    private String translateSeverity(String severity){

        return switch (severity){
            case "low" -> "منخفضة";
            case "medium" -> "متوسطة";
            case "high" -> "عالية";
            case "critical" -> "حرجة";
            default -> severity;
        };
    }
    private void sendIncidentAlert(Incident incident){

        Patient patient = patientRepository.findPatientById(incident.getPatientId());

        List<Caregiver> caregivers = caregiverRepository.findCaregiversByPatientId(incident.getPatientId());

        String incidentType = translateIncidentType(incident.getIncidentType());

        String severity = translateSeverity(incident.getSeverity());

        for (Caregiver caregiver : caregivers){

            String internationalPhone = "+966" + caregiver.getPhoneNumber().substring(1);

            whatsAppService.sendMessage(internationalPhone,

                    "تنبيه مهم من يسر ⚠️\n\n" +

                            "تم تسجيل " + incidentType +
                            " للمريض " + patient.getFullName() +
                            "، ودرجة الخطورة " + severity + ".\n\n" +

                            "التفاصيل: " + incident.getDescription() + "\n\n" +

                            "يرجى الاطلاع على الحالة في يسر في أقرب وقت."
            );
        }
    }

    private void sendResolvedIncidentAlert(Incident incident){

        Patient patient = patientRepository.findPatientById(incident.getPatientId());

        List<Caregiver> caregivers = caregiverRepository.findCaregiversByPatientId(
                        incident.getPatientId());
        String incidentType = translateIncidentType(incident.getIncidentType());

        for (Caregiver caregiver : caregivers){

            String internationalPhone = "+966" + caregiver.getPhoneNumber().substring(1);

            whatsAppService.sendMessage(
                    internationalPhone,

                    "تحديث من يسر 🌿\n\n" +

                            "الحمدلله، تم إغلاق حادث " + incidentType +
                            " للمريض " + patient.getFullName() +
                            " بنجاح.\n\n" +

                            "يمكنك الاطلاع على تفاصيل الحالة من خلال يسر."
            );
        }
    }
}
