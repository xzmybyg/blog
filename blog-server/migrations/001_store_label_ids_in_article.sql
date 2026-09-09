UPDATE article a
SET a.label = COALESCE(
  (
    SELECT GROUP_CONCAT(l.id ORDER BY l.id SEPARATOR ',')
    FROM label l
    WHERE FIND_IN_SET(l.label, a.label) > 0
  ),
  ''
)
WHERE a.label REGEXP '[^0-9,]';
