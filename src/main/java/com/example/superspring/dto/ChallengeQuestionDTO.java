package com.example.superspring.dto;

import lombok.Data;
import java.util.Map;

@Data
public class ChallengeQuestionDTO {
    private String id;
    private String type;
    private Map<String, Object> content;
    private Map<String, Object> answer;
    private Map<String, Object> meta;
} 