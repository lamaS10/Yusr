package com.example.yusr.Service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.twilio.base.ResourceSet;

import java.time.LocalDateTime;

@Service
public class WhatsAppService {
    @Value("${twilio.caregiver-invitation-content-sid}")
    private String caregiverInvitationContentSid;

    @Value("${twilio.account-sid}")
    private String accountSid;

    @Value("${twilio.auth-token}")
    private String authToken;

    @Value("${twilio.whatsapp-number}")
    private String whatsappNumber;


    public String sendMessage(String to, String messageBody){

        Twilio.init(accountSid, authToken);

        Message message = Message.creator(
                new PhoneNumber("whatsapp:" + to),
                new PhoneNumber("whatsapp:" + whatsappNumber),
                messageBody
        ).create();

        return message.getSid();
    }
    public String sendCaregiverInvitation(String to,
                                          String role,
                                          String patientName) {

        Twilio.init(accountSid, authToken);
        String roleArabic;

        if (role.equals("primary")) {
            roleArabic = "مقدم الرعاية الأساسي";
        } else if (role.equals("secondary")) {
            roleArabic = "مقدم رعاية مساعد";
        } else if (role.equals("backup")) {
            roleArabic = "مقدم رعاية بديل";
        } else {
            roleArabic = role;
        }

        String contentVariables =
                "{\"1\":\"" + roleArabic + "\",\"2\":\"" + patientName + "\"}";

        Message message = Message.creator(
                        new PhoneNumber("whatsapp:" + to),
                        new PhoneNumber("whatsapp:" + whatsappNumber),
                        (String) null
                )
                .setContentSid(caregiverInvitationContentSid)
                .setContentVariables(contentVariables)
                .create();

        return message.getSid();
    }

    // Gets the latest WhatsApp response received from a specific caregiver.
    public String getLatestCaregiverResponse(String phoneNumber, LocalDateTime invitationCreatedAt) {

        Twilio.init(accountSid, authToken);

        String internationalPhone = "+966" + phoneNumber.substring(1);

        ResourceSet<Message> messages = Message.reader()
                .setFrom(new PhoneNumber("whatsapp:" + internationalPhone))
                .setTo(new PhoneNumber("whatsapp:" + whatsappNumber))
                .limit(1)
                .read();

        for (Message message : messages) {

            if (message.getDateSent() == null) {
                return null;
            }

            LocalDateTime responseTime =
                    message.getDateSent().toLocalDateTime();

            if (responseTime.isBefore(invitationCreatedAt)) {
                return null;
            }

            return message.getBody();
        }

        return null;
    }
}