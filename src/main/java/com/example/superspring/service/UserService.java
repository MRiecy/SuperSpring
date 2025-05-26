package com.example.superspring.service;

import com.example.superspring.entity.User;
import java.util.List;
import java.util.Map;

public interface UserService {
    /**
     * 用户注册方法。
     * 该方法用于处理用户的注册逻辑，将用户提供的昵称和密码进行注册操作。
     * 在注册前会检查昵称是否已被使用，若未被使用则创建新用户并对密码进行加密存储。
     * 
     * @param nickname 用户注册时使用的昵称，用于唯一标识用户。
     * @param password 用户注册时输入的密码，将被加密后存储到数据库。
     * @return 返回注册成功后的用户对象，包含用户的基本信息。
     * @throws RuntimeException 若昵称已存在，抛出运行时异常提示昵称已被占用。
     */
    User register(String nickname, String password);
    User login(String nickname, String password);
    User updateNickname(Long userId, String newNickname);
    List<Map<String, Object>> getRanking();
} 