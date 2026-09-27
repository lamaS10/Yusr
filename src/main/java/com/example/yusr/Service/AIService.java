package com.example.yusr.Service;

import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AIService {

    private final ChatClient.Builder chatClientBuilder;

    public String generateSummary(String patientData) {

        String prompt = """
                You are an AI assistant in Yusr, a family care coordination system.

                Generate a clear and organized care summary based only on the provided patient records.

                Rules:
                - Do not diagnose any medical condition.
                - Do not recommend treatments or medications.
                - Do not suggest changing medication doses.
                - Do not add information that is not provided.
                - Clearly mention important recorded events.
                - Summarize medication activity, health readings, care tasks, incidents, and chronic conditions when available.
                - If a section has no records, state that no records were available.
                - Keep the summary professional, clear, and easy for caregivers to understand.
                - Write the entire summary in clear Arabic.
                - Use simple and professional Arabic suitable for family caregivers.
                - Keep medication names and medical values exactly as provided.
                - Organize the summary into clear Arabic sections with short headings.

                Patient care records:
                """ + patientData;

        return chatClientBuilder.build()
                .prompt()
                .user(prompt)
                .call()
                .content();
    }
}