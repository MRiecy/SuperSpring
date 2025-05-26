package com.example.superspring.dto;

import javax.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

/**
 * 用户登录请求数据传输对象
 */
@Getter
@Setter
public class LoginRequest {

    /**
     * 用户昵称
     */
    @NotBlank(message = "昵称不能为空")
    private String nickname;

    /**
     * 用户密码
     */
    @NotBlank(message = "密码不能为空")
    private String password;
} 