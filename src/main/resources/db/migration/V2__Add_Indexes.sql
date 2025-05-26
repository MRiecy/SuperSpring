-- 为用户表添加昵称索引
CREATE INDEX idx_user_nickname ON user(nickname);

-- 为测评记录表添加用户ID、分数和用时索引
CREATE INDEX idx_assessment_user_score ON assessment_record(user_id, score);
CREATE INDEX idx_assessment_user_time ON assessment_record(user_id, time_used);
CREATE INDEX idx_assessment_create_time ON assessment_record(create_time); 