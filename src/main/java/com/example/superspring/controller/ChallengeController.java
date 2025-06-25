package com.example.superspring.controller;

// import com.example.superspring.entity.ChallengeQuestion;
import com.example.superspring.common.ApiResponse;
import com.example.superspring.dto.ChallengeQuestionDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.List;
import java.util.Map;
// import com.fasterxml.jackson.core.type.TypeReference;
import java.util.Arrays;

@RestController
@RequestMapping("/api/challenge")
public class ChallengeController {
    @Autowired
    private com.example.superspring.service.ChallengeQuestionService challengeQuestionService;

    @Autowired
    private ObjectMapper objectMapper;

    @GetMapping("/questions")
    public ApiResponse<List<ChallengeQuestionDTO>> getQuestions() {
        // List<ChallengeQuestion> list = challengeQuestionService.list();
        // List<ChallengeQuestionDTO> dtoList = list.stream().map(q -> {
        //     ChallengeQuestionDTO dto = new ChallengeQuestionDTO();
        //     dto.setId(q.getId());
        //     dto.setType(q.getType());
        //     try {
        //         dto.setContent(objectMapper.readValue(q.getContent(), new TypeReference<Map<String, Object>>() {}));
        //         dto.setAnswer(objectMapper.readValue(q.getAnswer(), new TypeReference<Map<String, Object>>() {}));
        //         dto.setMeta(q.getMeta() != null ? objectMapper.readValue(q.getMeta(), new TypeReference<Map<String, Object>>() {}) : null);
        //     } catch (Exception e) {
        //         throw new RuntimeException("题目JSON字段解析失败", e);
        //     }
        //     return dto;
        // }).toList();
        // return ApiResponse.success(dtoList);
        // Mock数据
        List<ChallengeQuestionDTO> dtoList = Arrays.asList(
            buildMockQuestion1(),
            buildMockQuestion2()
        );
        return ApiResponse.success(dtoList);
    }

    private ChallengeQuestionDTO buildMockQuestion1() {
        ChallengeQuestionDTO dto = new ChallengeQuestionDTO();
        dto.setId("MATH_001");
        dto.setType("multiple_choice");
        dto.setContent(Map.of(
            "text", "下列哪个是方程 \\(x^2-5x+6=0\\) 的解？",
            "latex", "\\(x^2-5x+6=0\\)",
            "options", Arrays.asList("2", "3", "4", "5")
        ));
        dto.setAnswer(Map.of(
            "value", Arrays.asList("A", "B"),
            "explanation", Map.of(
                "text", "因式分解可得 \\((x-2)(x-3)=0\\)",
                "latex", "(x-2)(x-3)=0"
            )
        ));
        dto.setMeta(Map.of("difficulty", 3));
        return dto;
    }

    private ChallengeQuestionDTO buildMockQuestion2() {
        ChallengeQuestionDTO dto = new ChallengeQuestionDTO();
        dto.setId("MATH_002");
        dto.setType("fill_blank");
        dto.setContent(Map.of(
            "text", "\\(\\int_0^1 x^2 dx\\) 的值是多少？",
            "latex", "\\(\\int_0^1 x^2 dx\\)"
        ));
        dto.setAnswer(Map.of(
            "value", Arrays.asList("1/3"),
            "explanation", Map.of(
                "text", "积分公式 \\(\\int x^n dx = \\frac{x^{n+1}}{n+1} + C\\) ，代入计算。",
                "latex", "1/3"
            )
        ));
        dto.setMeta(Map.of("difficulty", 2));
        return dto;
    }
} 