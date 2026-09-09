CREATE TABLE IF NOT EXISTS article_topic (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(64) NOT NULL,
  description VARCHAR(255) NOT NULL DEFAULT '',
  createTime DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_article_topic_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE article
  ADD COLUMN topic_id INT NULL AFTER label,
  ADD INDEX idx_article_topic_id (topic_id),
  ADD CONSTRAINT fk_article_topic
    FOREIGN KEY (topic_id) REFERENCES article_topic(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT;
