package com.example.einternmatchback.Postulation.Services;


import dev.langchain4j.service.*;
import org.springframework.stereotype.Component;

@Component
public interface AIAgent {

    @UserMessage("{{message}}")
    String chat(String message);

}
