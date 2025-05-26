package com.example.superspring.dto;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

/**
 * 修改昵称请求数据传输对象
 */
@Getter
@Setter
public class UpdateNicknameRequest {

    /**
     * 用户ID
     */
    @NotNull(message = "用户ID不能为空")
    private Long userId;

    /**
     * 新昵称
     */
    @NotBlank(message = "新昵称不能为空")
    private String newNickname;
} 