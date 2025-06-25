package com.example.superspring.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableField;
import lombok.Data;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;

@Data
@TableName("challenge_question")
public class ChallengeQuestion {
    @TableId(type = IdType.INPUT)
    private String id;
    private String type;
    @TableField(typeHandler = JacksonTypeHandler.class)
    private String content; // 存储JSON字符串
    @TableField(typeHandler = JacksonTypeHandler.class)
    private String answer;  // 存储JSON字符串
    @TableField(typeHandler = JacksonTypeHandler.class)
    private String meta;    // 存储JSON字符串
} 