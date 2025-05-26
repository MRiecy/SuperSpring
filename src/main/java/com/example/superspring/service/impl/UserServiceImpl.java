package com.example.superspring.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.superspring.entity.User;
import com.example.superspring.mapper.UserMapper;
import com.example.superspring.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.DigestUtils;

import java.util.List;
import java.util.Map;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserMapper userMapper;

    /**
     * 实现用户注册功能。
     * 该方法会检查传入的昵称是否已被使用，若未被使用则创建新用户并加密存储密码。
     * 
     * @param nickname 用户注册时使用的昵称，用于唯一标识用户。
     * @param password 用户注册时输入的密码，后续会被加密存储。
     * @return 返回注册成功后的用户对象，包含用户的基本信息。
     * @throws RuntimeException 若昵称已存在，抛出运行时异常提示昵称已被占用。
     */
    @Override
    @Transactional // 开启事务管理，确保注册操作的原子性
    @CacheEvict(value = "rankingCache", key = "'ranking'")
    public User register(String nickname, String password) {
        // 检查昵称是否已存在
        // 创建一个 Lambda 形式的查询条件包装器，用于构建查询条件
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        // 设置查询条件：查询昵称等于传入的 nickname 的用户记录
        wrapper.eq(User::getNickname, nickname);
        // 调用 userMapper 的 selectCount 方法查询满足条件的用户记录数量
        if (userMapper.selectCount(wrapper) > 0) {
            // 若存在满足条件的记录，说明昵称已被使用，抛出异常
            throw new RuntimeException("昵称已存在");
        }

        // 创建新用户
        User user = new User();
        // 设置用户的昵称
        user.setNickname(nickname);
        // 密码加密
        // 使用 DigestUtils 的 md5DigestAsHex 方法对密码进行 MD5 加密
        user.setPassword(DigestUtils.md5DigestAsHex(password.getBytes()));
        // 调用 userMapper 的 insert 方法将新用户信息插入数据库
        userMapper.insert(user);
        // 返回注册成功的用户对象
        return user;
    }

    /**
     * 实现用户登录功能。
     * 该方法根据用户提供的昵称查找用户信息，并验证输入的密码是否正确。
     * 
     * @param nickname 用户登录时使用的昵称，用于查找对应的用户记录。
     * @param password 用户登录时输入的密码，将与数据库中存储的加密密码进行比对。
     * @return 返回登录成功后的用户对象，包含用户的基本信息。
     * @throws RuntimeException 若用户不存在或密码错误，抛出运行时异常提示相应错误信息。
     */
    @Override
    public User login(String nickname, String password) {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getNickname, nickname);
        User user = userMapper.selectOne(wrapper);
        
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }
        
        // 验证密码
        String encryptedPassword = DigestUtils.md5DigestAsHex(password.getBytes());
        if (!user.getPassword().equals(encryptedPassword)) {
            throw new RuntimeException("密码错误");
        }
        
        return user;
    }

    /**
     * 实现更新用户昵称的功能。
     * 该方法会先检查新昵称是否已被其他用户使用，若未被使用则进一步检查用户是否存在，
     * 若用户存在则更新用户的昵称并保存到数据库。
     * 
     * @param userId 用户的唯一标识 ID，用于查找需要更新昵称的用户。
     * @param newNickname 用户想要更新的新昵称。
     * @return 返回更新昵称后的用户对象。
     * @throws RuntimeException 若新昵称已存在，抛出异常提示昵称已被占用；
     *                          若用户不存在，抛出异常提示用户不存在。
     */
    @Override
    @Transactional
    @CacheEvict(value = "rankingCache", key = "'ranking'")
    public User updateNickname(Long userId, String newNickname) {
        // 检查新昵称是否已存在
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getNickname, newNickname);
        if (userMapper.selectCount(wrapper) > 0) {
            throw new RuntimeException("昵称已存在");
        }

        // 获取用户信息
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }

        // 更新昵称
        user.setNickname(newNickname);
        userMapper.updateById(user);
        return user;
    }

    /**
     * 实现获取用户排行榜信息的功能。
     * 该方法调用 UserMapper 中的 selectRanking 方法从数据库中查询排行榜数据，
     * 并将查询结果返回。排行榜数据包含用户昵称、最高得分和最短用时等信息。
     * 
     * @return 返回一个包含用户排行榜信息的列表，列表中的每个元素是一个 Map 对象，
     *         Map 的键为数据库查询结果的列名，值为对应的数据。
     */
    @Override
    @Cacheable(value = "rankingCache", key = "'ranking'", unless = "#result == null")
    public List<Map<String, Object>> getRanking() {
        // 调用 UserMapper 的 selectRanking 方法查询用户排行榜数据并返回
        return userMapper.selectRanking();
    }
} 