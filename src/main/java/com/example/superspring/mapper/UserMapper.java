package com.example.superspring.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.superspring.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Map;

@Mapper
public interface UserMapper extends BaseMapper<User> {
    
    /**
     * 查询用户排行榜信息，获取前 10 名用户的成绩数据。
     * 该方法通过 SQL 查询语句从用户表和测评记录表中获取用户的最高得分和最短用时，
     * 并按照最高得分降序、最短用时升序进行排序，最终返回前 10 名用户的信息。
     * 
     * @return 返回一个包含用户排行榜信息的列表，列表中的每个元素是一个 Map 对象，
     *         键为列名（如 "nickname", "max_score", "min_time"），值为对应的数据。
     */
    @Select("SELECT u.nickname, MAX(r.score) as max_score, MIN(r.time_used) as min_time " +
            "FROM user u " +
            "LEFT JOIN assessment_record r ON u.id = r.user_id " +
            "GROUP BY u.id, u.nickname " +
            "ORDER BY max_score DESC, min_time ASC " +
            "LIMIT 10")
    List<Map<String, Object>> selectRanking();
} 