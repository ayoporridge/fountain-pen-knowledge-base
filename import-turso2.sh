#!/bin/bash
set -e
cd /Users/xz/CodeBuddy/fountain-pen-graph

# 先清空所有表
for t in concept_matches entity_links entity_tags entity_attributes entities concept_rules tag_hierarchy tag_compositions tags migrations; do
  turso db shell fpkg "DROP TABLE IF EXISTS $t;" 2>/dev/null || true
done

# 尝试用 turso db import 导入 .db 文件
turso db import data/fpkg.db

echo "=== 验证 ==="
turso db shell fpkg "SELECT COUNT(*) AS entities FROM entities;"
turso db shell fpkg "SELECT COUNT(*) AS tags FROM tags;"
turso db shell fpkg "SELECT COUNT(*) AS links FROM entity_links;"
