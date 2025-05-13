package com.example.einternmatchback.Postulation.Services;



import dev.langchain4j.memory.chat.MessageWindowChatMemory;
import dev.langchain4j.model.chat.ChatModel;
import dev.langchain4j.model.googleai.GoogleAiGeminiChatModel;
import dev.langchain4j.service.AiServices;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;


@Configuration
public class AIConfig {


    @Bean
    public ChatModel gemini() {
        return GoogleAiGeminiChatModel.builder()
                .apiKey("AIzaSyAf0dmekqfaYv5f_kCcBiK7zHv0oIulfbY")
                .modelName("gemini-1.5-flash")
                .logRequestsAndResponses(true)
                .temperature(0.0)
                .build();
    }


    @Bean
    public AIAgent aiAgent(TOLS tools, ChatModel gemini) {
        return AiServices.builder(AIAgent.class)
                .chatModel(gemini)
                .chatMemory(MessageWindowChatMemory.withMaxMessages(10))
                .tools(tools)
                .build();
    }



}