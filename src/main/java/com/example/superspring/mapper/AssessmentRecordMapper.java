package com.example.superspring.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.superspring.entity.AssessmentRecord;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Map;

@Mapper
public interface AssessmentRecordMapper extends BaseMapper<AssessmentRecord> {
    
    /**
     * 查询用户的历史记录，最多返回20条最近的记录
     * @param userId 用户ID
     * @return 历史记录列表
     */
    @Select("SELECT score, time_used as timeUsed, create_time as createTime " +
            "FROM assessment_record " +
            "WHERE user_id = #{userId} " +
            "ORDER BY create_time DESC " +
            "LIMIT 20")
    List<Map<String, Object>> selectUserHistory(Long userId);
} 