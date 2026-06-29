#!/bin/bash
set -e
cd /Users/xz/Documents/fountain-pen-graph

echo "=== 清空表 ==="
for t in concept_matches entity_links entity_tags entity_attributes entities concept_rules tag_hierarchy tag_compositions tags migrations; do
  turso db shell fpkg "DROP TABLE IF EXISTS $t;"
done

echo "=== 导入数据 ==="
turso db shell fpkg < /tmp/fpkg-nofts.sql

echo "=== 验证 ==="
turso db shell fpkg "SELECT COUNT(*) AS entities FROM entities;"
turso db shell fpkg "SELECT COUNT(*) AS tags FROM tags;"
turso db shell fpkg "SELECT COUNT(*) AS links FROM entity_links;"
