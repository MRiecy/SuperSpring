package com.example.superspring.common;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "通用API响应包装类")
public class ApiResponse<T> {
    @Schema(description = "状态码,0表示成功,非0表示失败")
    private int code;
    @Schema(description = "提示信息")
    private String message;
    @Schema(description = "响应数据")
    private T data;

    public ApiResponse() {}
    public ApiResponse(int code, String message, T data) {
        this.code = code;
        this.message = message;
        this.data = data;
    }
    /**
     * 创建一个表示成功响应的 ApiResponse 对象。
     * 该方法会设置状态码为 0（代表成功），提示信息为 "success"，并将传入的数据封装到响应对象中。
     * 
     * @param <T> 响应数据的类型，由调用者指定。
     * @param data 要封装到响应中的数据对象。
     * @return 一个包含成功状态信息和响应数据的 ApiResponse 对象。
     */
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(0, "success", data);
    }

    /**
     * 创建一个表示错误响应的 ApiResponse 对象。
     * 该方法会设置状态码为 1（代表失败），并将传入的错误提示信息封装到响应对象中，响应数据部分为 null。
     * 
     * @param <T> 响应数据的类型，由调用者指定。
     * @param message 错误提示信息，用于向客户端说明错误原因。
     * @return 一个包含错误状态信息和错误提示的 ApiResponse 对象。
     */
    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(1, message, null);
    }
    public int getCode() { return code; }
    public void setCode(int code) { this.code = code; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public T getData() { return data; }
    public void setData(T data) { this.data = data; }
} 