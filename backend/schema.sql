-- 题目表
CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY, -- 唯一标识 BIO-xxx
    topic TEXT,
    keywords TEXT,
    paper_title TEXT,
    paper_link TEXT,
    difficulty_level INTEGER, -- 1, 2, 3
    question_content TEXT, -- JSON 存储题干和选项
    answer_analysis TEXT, -- 答案和解析
    has_image BOOLEAN,
    image_r2_path TEXT, -- R2 中的图片路径
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
