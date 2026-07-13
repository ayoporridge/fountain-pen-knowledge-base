-- Imported source pages sometimes carried their own site-navigation links.
-- They are neither part of the article nor valid routes in this archive.
UPDATE entities
SET body_md = REPLACE(
      body_md,
      '[ **[ 参考资料索引](<ref/00_refp.htm> "跳转至参考资料索引页") ** | **[ 钢笔百科](<ref/gloss/00_gls.htm> "跳转至钢笔百科") ** ]' || char(10),
      ''
    ),
    updated_at = datetime('now')
WHERE body_md LIKE '%参考资料索引%';

UPDATE entities
SET body_md = REPLACE(
      body_md,
      '# 钢笔档案：Connaisseur——化平凡为神奇的Sheaffer钢笔公司' || char(10) ||
      '[ **[参考资料索引](<ref/00_refp.htm> "前往参考资料索引页面")** | **[钢笔百科](<ref/gloss/00_gls.htm> "前往钢笔百科")** ]' || char(10),
      ''
    ),
    updated_at = datetime('now')
WHERE body_md LIKE '%参考资料索引%';
