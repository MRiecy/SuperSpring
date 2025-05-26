package com.example.superspring.controller;

import com.example.superspring.entity.User;
import com.example.superspring.service.UserService;
import com.example.superspring.dto.RegisterRequest;
import com.example.superspring.dto.LoginRequest;
import com.example.superspring.dto.UpdateNicknameRequest;
import com.example.superspring.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.MediaType;

import jakarta.servlet.http.HttpSession;
import javax.validation.Valid;
import java.util.List;
import java.util.Map;

@Tag(name = "用户相关接口")
@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    /**
     * 注册账号
     */
    @Operation(summary = "用户注册", description = "注册新账号，传入昵称、密码和确认密码")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "注册成功，返回用户信息",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = User.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "注册失败，返回错误信息",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = ApiResponse.class)))
        })
    @PostMapping("/register")
    public ApiResponse<User> register(@RequestBody @Valid RegisterRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            return ApiResponse.error("两次输入的密码不一致");
        }
        try {
            User user = userService.register(request.getNickname(), request.getPassword());
            return ApiResponse.success(user);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * 登录账号
     */
    @Operation(summary = "用户登录", description = "用户登录，传入昵称和密码")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "登录成功，返回用户信息",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = User.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "登录失败，返回错误信息",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = ApiResponse.class)))
        })
    @PostMapping("/login")
    public ApiResponse<User> login(@RequestBody @Valid LoginRequest request) {
        try {
            User user = userService.login(request.getNickname(), request.getPassword());
            return ApiResponse.success(user);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * 更改账号昵称
     */
    @Operation(summary = "修改昵称", description = "修改用户昵称，传入用户ID和新昵称")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "修改成功，返回用户信息",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = User.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "修改失败，返回错误信息",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = ApiResponse.class)))
        })
    @PostMapping("/nickname")
    public ApiResponse<User> updateNickname(@RequestBody @Valid UpdateNicknameRequest request) {
        try {
            User user = userService.updateNickname(request.getUserId(), request.getNewNickname());
            return ApiResponse.success(user);
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * 获取排行榜
     */
    @Operation(summary = "获取排行榜", description = "获取用户排行榜数据")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "获取成功，返回排行榜列表",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                            array = @ArraySchema(schema = @Schema(implementation = Map.class)))), // 排行榜返回的是List<Map>，这里简化表示为Map数组
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "获取失败，返回错误信息",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = ApiResponse.class)))
        })
    @GetMapping("/ranking")
    public ApiResponse<List<Map<String, Object>>> getRanking() {
        try {
            return ApiResponse.success(userService.getRanking());
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * 检查用户登录状态
     * 该方法用于检查当前用户是否已登录，若已登录则返回用户信息，若未登录则返回未登录提示。
     * @param session HttpSession对象，用于获取存储在会话中的用户信息
     * @return ApiResponse对象，包含用户信息或错误信息
     */
    @Operation(summary = "检查用户登录状态", description = "检查当前用户是否已登录，返回用户信息或未登录提示")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "已登录，返回用户信息",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = User.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "未登录，返回错误信息",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = ApiResponse.class)))
        })
    @GetMapping("/status")
    public ApiResponse<User> status(HttpSession session) {
        // 从HttpSession中获取存储的用户信息
        User user = (User) session.getAttribute("user");
        if (user != null) {
            return ApiResponse.success(user);
        } else {
            return ApiResponse.error("未登录");
        }
    }
} 