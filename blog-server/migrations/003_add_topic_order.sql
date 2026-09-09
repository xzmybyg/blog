ALTER TABLE article
  ADD COLUMN topic_order INT NOT NULL DEFAULT 0 AFTER topic_id,
  ADD INDEX idx_article_topic_order (topic_id, topic_order, createTime, id);
