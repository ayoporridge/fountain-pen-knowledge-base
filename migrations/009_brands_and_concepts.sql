-- Migration 009: Add brand and concept entities
-- Extracts brands from pen names, creates brand entities and links
-- Adds missing concept entities for fill systems and nib types
--
-- Verification:
--   SELECT COUNT(*) FROM entities WHERE type = 'brand';  -- >= 15
--   SELECT COUNT(*) FROM entities WHERE type = 'concept'; -- >= 8
--   SELECT COUNT(*) FROM entity_links WHERE link_type = 'made_by';

-- ============================================================
-- PART 1: Create brand entities
-- ============================================================

INSERT OR IGNORE INTO entities (id, type, slug, name, summary)
  VALUES ('ce2dcqixqSCx', 'brand', 'sailor', '写乐 (Sailor)', '日本三大钢笔品牌之一，以笔尖调教闻名，长刀研是旗舰系列');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('N6jNTHgOjT1B', 'ce2dcqixqSCx', 'founded', '1911');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('rrcBLvtvfMhT', 'ce2dcqixqSCx', 'origin_country', '日本');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary)
  VALUES ('e51tJpejEkXY', 'brand', 'platinum', '白金 (Platinum)', '日本三大钢笔品牌之一，3776系列性价比突出');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('PQkPdp9eAy6j', 'e51tJpejEkXY', 'founded', '1919');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('CHqVPbwOicrK', 'e51tJpejEkXY', 'origin_country', '日本');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary)
  VALUES ('lMGfoMjegnv8', 'brand', 'namiki', '并木 (Namiki)', '百乐旗下顶级漆艺钢笔品牌，代表日本传统工艺');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('30UZcSJRwMGC', 'lMGfoMjegnv8', 'founded', '1918');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('ndAynCwdbtwv', 'lMGfoMjegnv8', 'origin_country', '日本');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary)
  VALUES ('qrZay1FxJDjd', 'brand', 'nakaya', '中屋 (Nakaya)', '并木前匠人创立的高端定制钢笔品牌，专注黑漆美学');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('Ft1m0PmCwTXX', 'qrZay1FxJDjd', 'founded', '1999');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('36Id9BclwMmr', 'qrZay1FxJDjd', 'origin_country', '日本');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary)
  VALUES ('eOfD77nOeENN', 'brand', 'wancher', 'Wancher', '日本钢笔品牌，Dream Pen 系列有独特设计');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('69TVkCGsZAzv', 'eOfD77nOeENN', 'origin_country', '日本');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary)
  VALUES ('VXUULuCOLOB1', 'brand', 'pelikan', '百利金 (Pelikan)', '德国百年品牌，活塞上墨的代表，Souverän 条纹笔身是经典');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('71WO2lLaIfG5', 'VXUULuCOLOB1', 'founded', '1838');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('eJBk0RpMy5W9', 'VXUULuCOLOB1', 'origin_country', '德国');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary)
  VALUES ('CJM8uLY0LmIX', 'brand', 'montblanc', '万宝龙 (Montblanc)', '德国奢侈品牌，大班 Meisterstück 是行业标杆');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('82eyhaJSfcaf', 'CJM8uLY0LmIX', 'founded', '1906');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('ClHqStfRFiaG', 'CJM8uLY0LmIX', 'origin_country', '德国');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary)
  VALUES ('ySwGGq4bhvOA', 'brand', 'lamy', '凌美 (LAMY)', '德国现代设计品牌，Safari 狩猎者是入门经典');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('xLdMNCQnVDmJ', 'ySwGGq4bhvOA', 'founded', '1930');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('i4OuxN9FU5MO', 'ySwGGq4bhvOA', 'origin_country', '德国');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary)
  VALUES ('xVHzH0mMviM4', 'brand', 'faber-castell', '辉柏嘉 (Faber-Castell)', '德国最古老书写工具品牌之一（1761年），以铅笔起家');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('0x4QkH0uqeiZ', 'xVHzH0mMviM4', 'founded', '1761');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('bVfcNhaFGsXP', 'xVHzH0mMviM4', 'origin_country', '德国');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary)
  VALUES ('mRz7MvzUYwVF', 'brand', 'kaweco', 'Kaweco', '德国口袋钢笔品牌，Sport 系列经典');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('iIHUehQgevp7', 'mRz7MvzUYwVF', 'founded', '1883');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('WEZ6JH9vF6M9', 'mRz7MvzUYwVF', 'origin_country', '德国');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary)
  VALUES ('4kID3Wqc15O6', 'brand', 'diplomat', 'Diplomat', '德国钢笔品牌，Aero 太空梭系列知名');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('J5q2rVqfbe6G', '4kID3Wqc15O6', 'founded', '1922');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('dFYTOkn4CNab', '4kID3Wqc15O6', 'origin_country', '德国');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary)
  VALUES ('4RLQzNpb6WbN', 'brand', 'schneider', '施耐德 (Schneider)', '德国文具品牌，BK402 是入门推荐');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('bmdjO8xIuChT', '4RLQzNpb6WbN', 'founded', '1938');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('lnGQrYRLpZ3B', '4RLQzNpb6WbN', 'origin_country', '德国');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary)
  VALUES ('vhqNYqDChhiN', 'brand', 'parker', '派克 (Parker)', '美国经典品牌，51 是史上最成功的钢笔');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('Huz4oPNkdu2s', 'vhqNYqDChhiN', 'founded', '1888');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('2ZUF50FJSCkZ', 'vhqNYqDChhiN', 'origin_country', '美国');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary)
  VALUES ('zkAu9PePDdqJ', 'brand', 'waterman', '威迪文 (Waterman)', '法国品牌（美国起源），海韵 Carène 是旗舰');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('tNHUxzdxrbWT', 'zkAu9PePDdqJ', 'founded', '1883');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('PpPEfAqQwj36', 'zkAu9PePDdqJ', 'origin_country', '法国');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary)
  VALUES ('tVXnzDSFCcPP', 'brand', 'sheaffer', '犀飞利 (Sheaffer)', '美国老牌，触碰上墨和 Snorkel 是独创机构');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('hFzTBHLDwhXa', 'tVXnzDSFCcPP', 'founded', '1912');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('vxrbhZndIIxJ', 'tVXnzDSFCcPP', 'origin_country', '美国');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary)
  VALUES ('AcglIcVOba3Y', 'brand', 'cross', '高仕 (Cross)', '美国书写工具品牌，以签字笔知名');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('7Pleid4uu5fc', 'AcglIcVOba3Y', 'founded', '1846');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('F7f0AS2iOddw', 'AcglIcVOba3Y', 'origin_country', '美国');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary)
  VALUES ('b6DYMF38zz1B', 'brand', 'esterbrook', 'Esterbrook', '美国经典品牌，Model J 系列是平价经典');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('eohbyYN6QSID', 'b6DYMF38zz1B', 'founded', '1858');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('LKnG9CGnzUUM', 'b6DYMF38zz1B', 'origin_country', '美国');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary)
  VALUES ('9gaEROr1PX3t', 'brand', 'noodlers', 'Noodler (Noodler''s)', '美国墨水及钢笔品牌，以防水墨水闻名');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('efJOJU7NHxoa', '9gaEROr1PX3t', 'origin_country', '美国');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary)
  VALUES ('kFT81caNK3tP', 'brand', 'eversharp', 'Eversharp', '美国经典品牌（Wahl-Eversharp），Skyline 和 Doric 是经典');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('QRnbVDworSPe', 'kFT81caNK3tP', 'founded', '1915');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('EQ3kqaJxBwFg', 'kFT81caNK3tP', 'origin_country', '美国');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary)
  VALUES ('aijX3l7Eed6N', 'brand', 'wahl', 'Wahl', 'Wahl-Eversharp 前身，以 Wahl Pen 和 Doric 闻名');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('pYjUkjNQF0dO', 'aijX3l7Eed6N', 'founded', '1896');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('zB5dBsqSfh1T', 'aijX3l7Eed6N', 'origin_country', '美国');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary)
  VALUES ('9UPHCybD7qAX', 'brand', 'conklin', 'Conklin', '美国经典品牌，首创 Crescent 上墨杆');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('5INrYek45EH9', '9UPHCybD7qAX', 'founded', '1898');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('N7wg6KjrAIym', '9UPHCybD7qAX', 'origin_country', '美国');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary)
  VALUES ('fvOdtqcgGCmx', 'brand', 'moore', 'Moore', '美国经典品牌，Non-Leakable 是早期代表');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('0cG97RBlCZcA', 'fvOdtqcgGCmx', 'founded', '1860s');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('U9Wrz7FFq9O3', 'fvOdtqcgGCmx', 'origin_country', '美国');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary)
  VALUES ('6bBDoAc4ULKm', 'brand', 'chilton', 'Chilton', '美国经典品牌，Chiltonian 和 Wing-flow 系列');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('FQLqHsOQfE3v', '6bBDoAc4ULKm', 'founded', '1920s');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('2CYcH62obM31', '6bBDoAc4ULKm', 'origin_country', '美国');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary)
  VALUES ('tXa1mG6HXRJa', 'brand', 'morrison', 'Morrison', '美国经典品牌');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('3cWgH2jB8KKr', 'tXa1mG6HXRJa', 'founded', '1910s');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('jNzfEX3hqy6T', 'tXa1mG6HXRJa', 'origin_country', '美国');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary)
  VALUES ('x0PbAr6vvwf9', 'brand', 'wearever', 'Wearever', '美国大众品牌，平价入门笔');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('csLiWwRYMk17', 'x0PbAr6vvwf9', 'founded', '1918');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('onb21xgwhSM1', 'x0PbAr6vvwf9', 'origin_country', '美国');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary)
  VALUES ('7ayTZUG4BVgU', 'brand', 'ingersoll', 'Ingersoll', '美国品牌，Dollar Pen 代表');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('VWvHnq3Pof8l', '7ayTZUG4BVgU', 'founded', '1890s');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('aStbPrzIK245', '7ayTZUG4BVgU', 'origin_country', '美国');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary)
  VALUES ('pwbUeoKAp7xI', 'brand', 'dunn', 'Dunn', '美国经典品牌');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('CjXVOe15RVZF', 'pwbUeoKAp7xI', 'origin_country', '美国');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary)
  VALUES ('97fwqRaz02kE', 'brand', 'wasp', 'WASP', 'Eversharp 旗下子品牌');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('LRkFJErRFbR3', '97fwqRaz02kE', 'founded', '1930s');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('ZlrTO5HBCREj', '97fwqRaz02kE', 'origin_country', '美国');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary)
  VALUES ('5BZDt2fQusMf', 'brand', 'visconti', '维斯康蒂 (Visconti)', '意大利高端品牌，Homo Sapiens 智人系列用火山岩材质');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('CUjlF9bkm9tY', '5BZDt2fQusMf', 'founded', '1988');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('drc0ZWGuzgRd', '5BZDt2fQusMf', 'origin_country', '意大利');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary)
  VALUES ('CJXe8UpnkHLJ', 'brand', 'aurora', '奥罗拉 (Aurora)', '意大利钢笔品牌，历史超过百年');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('7hSWfV5pDPUl', 'CJXe8UpnkHLJ', 'founded', '1919');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('qv4Dby3HZTQY', 'CJXe8UpnkHLJ', 'origin_country', '意大利');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary)
  VALUES ('g5r4udSOYhI5', 'brand', 'leonardo', 'Leonardo', '意大利手工钢笔品牌，Furore 系列知名');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('GQBgm7sSS4so', 'g5r4udSOYhI5', 'founded', '2012');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('5Ctijzv6M4Pd', 'g5r4udSOYhI5', 'origin_country', '意大利');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary)
  VALUES ('4yRpvovXFoWh', 'brand', 'hongdian', '弘典 (HongDian)', '中国新锐品牌，黑森林和 N6 是代表作，性价比极高');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('YyTsDQNFaspb', '4yRpvovXFoWh', 'origin_country', '中国');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary)
  VALUES ('Yulxwu7PuQAU', 'brand', 'jinhao', '金豪 (Jinhao)', '中国品牌，入门级高性价比，82 和世纪系列畅销');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('fu3qAieE0KtG', 'Yulxwu7PuQAU', 'origin_country', '中国');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary)
  VALUES ('TfXerdAZ5iWg', 'brand', 'majohn', '末匠 (Majohn)', '中国品牌（原名 Moonman），A1 按动笔开创国产先河');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('joQFpSrKwrjn', 'TfXerdAZ5iWg', 'origin_country', '中国');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary)
  VALUES ('LIfzzmbCfFPt', 'brand', 'hero', '英雄 (Hero)', '中国最具历史的钢笔品牌，100 系列是国产经典');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('qzQD8enwVKt6', 'LIfzzmbCfFPt', 'founded', '1931');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('xurtmQRcx2Kb', 'LIfzzmbCfFPt', 'origin_country', '中国');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary)
  VALUES ('5WJw8padPmKF', 'brand', 'wingsung', '永生 (WingSung)', '中国品牌，601 系列致敬派克 51');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('gAchqYMHhs8S', '5WJw8padPmKF', 'origin_country', '中国');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary)
  VALUES ('fXMP6pCWfPjq', 'brand', 'penbbs', '坛笔 (PenBBS)', '中国文具爱好者社区品牌，产量高配色多');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('HS29ZbKsHz9B', 'fXMP6pCWfPjq', 'origin_country', '中国');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary)
  VALUES ('YTHuH8c3R9zl', 'brand', 'twsbi', '三文堂 (TWSBI)', '台湾品牌，透明活塞钢笔代表，ECO 是入门首选');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('qaZfTxL1BIVh', 'YTHuH8c3R9zl', 'founded', '2009');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('x471g2qIA2V2', 'YTHuH8c3R9zl', 'origin_country', '中国台湾');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary)
  VALUES ('5zbJPFGxfCXu', 'brand', 'picasso', '毕加索 (Picasso)', '中国钢笔品牌，916 系列是入门推荐');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('6JsSYK9jsfRm', '5zbJPFGxfCXu', 'origin_country', '中国');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary)
  VALUES ('5AB8Cngbp1un', 'brand', 'delike', '得力克 (Delike)', '中国钢笔品牌，元素系列有独特设计');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('azpr3lxRNKsN', '5AB8Cngbp1un', 'origin_country', '中国');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary)
  VALUES ('sBV7J5ZK4msi', 'brand', 'kaco', '文采 (KACO)', '中国设计品牌，Master 和 Edge 系列有高端追求');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('jRHBVV1Qn4gB', 'sBV7J5ZK4msi', 'origin_country', '中国');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary)
  VALUES ('70VSUqdIrGVc', 'brand', 'mg', '晨光 (M&G)', '中国最大文具品牌，按动钢笔是入门产品');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('sJ70a92c5iRZ', '70VSUqdIrGVc', 'founded', '1996');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('m0vEQTz4RS1M', '70VSUqdIrGVc', 'origin_country', '中国');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary)
  VALUES ('z6qsxNL0PAj8', 'brand', 'skb', 'SKB', '中国钢笔品牌（派顿）');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('wMEYXUYtTiqK', 'z6qsxNL0PAj8', 'origin_country', '中国');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary)
  VALUES ('u872EQEhnTzA', 'brand', 'jinxing', '金星 (JinXing)', '中国钢笔品牌，双尖钢笔有特色');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('GBR8DwFpfZxQ', 'u872EQEhnTzA', 'origin_country', '中国');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary)
  VALUES ('uppuHJzvuw5k', 'brand', 'shanghai', '上海 (ShangHai)', '中国品牌，97回归系列有纪念意义');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('zKsB5rSSX54H', 'uppuHJzvuw5k', 'origin_country', '中国');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary)
  VALUES ('v303FVWUV9sR', 'brand', 'dongwu', '东吴 (DongWu)', '中国钢笔品牌');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('6IIkmAFGCZAr', 'v303FVWUV9sR', 'origin_country', '中国');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary)
  VALUES ('vwSTpWgNYlPe', 'brand', 'dagong', '大公 (Dagong)', '中国钢笔品牌，揿动式设计');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('A0jnlb2pIGy3', 'vwSTpWgNYlPe', 'origin_country', '中国');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary)
  VALUES ('DnQI7CPpnewz', 'brand', 'shule', '书乐 (ShuLe)', '中国钢笔品牌');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('ihL0zMnGm3J4', 'DnQI7CPpnewz', 'origin_country', '中国');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary)
  VALUES ('ncUFilOHTET2', 'brand', 'yiren', '依人 (YiRen)', '中国钢笔品牌');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('T6iWNJVfsCkS', 'ncUFilOHTET2', 'origin_country', '中国');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary)
  VALUES ('2Ay71LNqmFAb', 'brand', 'duke', '公爵 (Duke)', '中国钢笔品牌');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('g1pIVSUpu35h', '2Ay71LNqmFAb', 'origin_country', '中国');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary)
  VALUES ('kBv3hmJfi366', 'brand', 'saier', '塞尔 (Saier)', '中国钢笔品牌');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('5PD884XN0qH9', 'kBv3hmJfi366', 'origin_country', '中国');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary)
  VALUES ('FER68geLQkcJ', 'brand', 'tangyue', '唐月 (TangYue)', '中国钢笔品牌');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('Y87Lv1VcKZYv', 'FER68geLQkcJ', 'origin_country', '中国');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary)
  VALUES ('dd8FyxqCoIUb', 'brand', 'snowhite', '白雪 (Snowhite)', '中国文具品牌');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('IXxsDf0IR2FP', 'dd8FyxqCoIUb', 'origin_country', '中国');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary)
  VALUES ('iBdg7LUlPdde', 'brand', 'lily', '铃兰 (Lily)', '中国钢笔品牌');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('LOefMRpAKrfi', 'iBdg7LUlPdde', 'origin_country', '中国');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary)
  VALUES ('S3JHYQtqJExx', 'brand', 'banju', '半句 (BanJu)', '中国钢笔品牌');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('InFzFrQlQUCL', 'S3JHYQtqJExx', 'origin_country', '中国');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary)
  VALUES ('vkvhr34TkrUy', 'brand', 'campus', '欧领 (Campus)', '中国钢笔品牌');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('jcmz7t4Ihqle', 'vkvhr34TkrUy', 'origin_country', '中国');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary)
  VALUES ('yTWZrIZnGyMx', 'brand', 'yongxu', '永续 (YongXu)', '中国钢笔品牌');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('hr9ENHvVA1li', 'yTWZrIZnGyMx', 'origin_country', '中国');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary)
  VALUES ('xGmfK8jpUCnX', 'brand', 'paili', '派利 (Paili)', '中国钢笔品牌');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('NO3NglX5txEk', 'xGmfK8jpUCnX', 'origin_country', '中国');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary)
  VALUES ('O8u4aqylQqJ7', 'brand', 'lanbitou', '烂笔头 (Lanbitou)', '中国钢笔品牌，3059 是入门推荐');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('GPM5ScHEJCPy', 'O8u4aqylQqJ7', 'origin_country', '中国');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary)
  VALUES ('1gAp6eiclNnS', 'brand', 'admok', 'Admok', '中国钢笔品牌');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('FTSh2Z9uhdQt', '1gAp6eiclNnS', 'origin_country', '中国');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary)
  VALUES ('2OpQMjam65SM', 'brand', 'monteverde', '万特佳 (Monteverde)', '美国品牌，以多彩配色闻名');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('ZwK7KWhiycPZ', '2OpQMjam65SM', 'origin_country', '美国');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary)
  VALUES ('JhjxtpEQZx4g', 'brand', 'tramol', 'Tramol', '中国钢笔品牌，梵高系列有艺术气息');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('IByGwkIR5caD', 'JhjxtpEQZx4g', 'origin_country', '中国');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary)
  VALUES ('mZNUfRureJsC', 'brand', 'zhangjiang', '长江 (ZhangJiang)', '中国钢笔品牌');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('triayERtzZnR', 'mZNUfRureJsC', 'origin_country', '中国');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary)
  VALUES ('CwfFGW5zsocf', 'brand', 'douwan', '逗万 (DouWan)', '中国钢笔品牌，流光系列');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('5a0H9OqsbdnK', 'CwfFGW5zsocf', 'origin_country', '中国');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary)
  VALUES ('I6tjleAZx9RU', 'brand', 'opus88', 'Opus 88', '台湾品牌，滴入式上墨代表');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('zyovDSRnTHRH', 'I6tjleAZx9RU', 'origin_country', '中国台湾');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary)
  VALUES ('qpcW25Dw0fxW', 'brand', 'hero-paddy', '英雄派迪 (Hero Paddy)', '英雄旗下子品牌');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('BKhU1GxdHsO5', 'qpcW25Dw0fxW', 'origin_country', '中国');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary)
  VALUES ('hxjmiofFHTMa', 'brand', 'graphomatic', 'Graphomatic', '钢笔品牌');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary)
  VALUES ('mx3fnAnteiHS', 'brand', 'yisihua', '意斯华 (YiSiHua)', '中国钢笔品牌');
INSERT OR IGNORE INTO entity_attributes (id, entity_id, key, value)
  VALUES ('XJPhRnG5EtRv', 'mx3fnAnteiHS', 'origin_country', '中国');

-- Total new brand entities: 68
-- Existing brand (Pilot): Zt-PbXkE7UHM

-- ============================================================
-- PART 2: Create pen -> brand links (made_by)
-- ============================================================

-- waterman (13 pens)
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('Br1vFusjuoHY', 'W1DGMmj-Qk3H', 'zkAu9PePDdqJ', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('WWi7CR9WftJm', 'kN4e-bTwsjSG', 'zkAu9PePDdqJ', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('nrRjDXh5HZia', 'XFAIQh9DFHy5', 'zkAu9PePDdqJ', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('S3Dp1U3Q20Qa', 'uv2i39w3bdq8', 'zkAu9PePDdqJ', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('8XF6hdtt02fJ', 'AqN2ex1B7A2S', 'zkAu9PePDdqJ', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('iLtc6YPUN7cp', 'LABL8G83Je3e', 'zkAu9PePDdqJ', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('j7zoWKHFNAzB', 'qARhZdSptc8L', 'zkAu9PePDdqJ', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('RPzsGgZ8v56k', 'L7-9RXn0xgQr', 'zkAu9PePDdqJ', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('aqIdrPnzR0Kw', 'tjNAIANBlu4H', 'zkAu9PePDdqJ', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('arzVzmZaRVcZ', 'R-NhnAX3A7no', 'zkAu9PePDdqJ', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('0ZGYoHKLNeQq', 'YAiCRah1XAsz', 'zkAu9PePDdqJ', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('J25ObeaqSJNA', 'gwKClNnwt3V3', 'zkAu9PePDdqJ', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('ckam6t37KThH', 'qsuRSNYKpI6-', 'zkAu9PePDdqJ', 'made_by');

-- admok (1 pens)
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('fjBueH0yfAJJ', 'oG3jXGONflH3', '1gAp6eiclNnS', 'made_by');

-- diplomat (1 pens)
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('YcOFpZA9NJ2L', 'yWhmvp5a_J1A', '4kID3Wqc15O6', 'made_by');

-- esterbrook (3 pens)
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('Tx6xXr7l1gqi', 'Xn2g9NlYnU8t', 'b6DYMF38zz1B', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('EV4I7MfA4wdG', 'j2q37WUZwhAx', 'b6DYMF38zz1B', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('7UNcXSuax8qD', 'auTnDsV6_Cu2', 'b6DYMF38zz1B', 'made_by');

-- graphomatic (1 pens)
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('gl5Ij55doudE', '6K8Xw-a3zNoT', 'hxjmiofFHTMa', 'made_by');

-- moore (3 pens)
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('Ivc9YSpCpiCD', 'WiwJwvuGcxtG', 'fvOdtqcgGCmx', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('KPDfcx9K2ng7', '979eBhBZJMjH', 'fvOdtqcgGCmx', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('EYpBzdQEBmAt', 'BbRrESWOy_c1', 'fvOdtqcgGCmx', 'made_by');

-- kaco (3 pens)
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('sKA0TrLC6iOH', 'BTrjxhx1ByXM', 'sBV7J5ZK4msi', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('auaPWud0T2sS', 'WgPQyH1oYSEX', 'sBV7J5ZK4msi', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('UNgyF7BbipGb', 'mB3Ad49lhus2', 'sBV7J5ZK4msi', 'made_by');

-- kaweco (4 pens)
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('l4qAAUpB3PRC', 'MV78JwjMOd6h', 'mRz7MvzUYwVF', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('tTK7bNSr9Q6w', '7HaZSCUZHaBE', 'mRz7MvzUYwVF', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('if1dgIB8nFS8', 'JhyxWW1Ylw-A', 'mRz7MvzUYwVF', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('yoyxp9WVJt0O', 'ZOuVvOu_nGSP', 'mRz7MvzUYwVF', 'made_by');

-- eversharp (10 pens)
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('JoDh7SD07zIf', 'uT6Y8uYGGu-m', 'kFT81caNK3tP', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('a1j4YFqhMK69', '0TKGvP8286P4', 'kFT81caNK3tP', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('p42GJDwJkKPs', 'DhUCJ0JY981I', 'kFT81caNK3tP', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('pk7RVlNzl0bV', 'jsaIHm2zkn71', 'kFT81caNK3tP', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('FuhwXQJtyaQ8', 'WrCQ5ThC02bH', 'kFT81caNK3tP', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('qsDrcVbAQjow', 'sPc3hIp2ppOm', 'kFT81caNK3tP', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('smsQPvnafGYy', 'X4_G155rRuuf', 'kFT81caNK3tP', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('nxt5kdPXf0kS', 'YR3Robg9_PYt', 'kFT81caNK3tP', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('nXWnkJRLNZd5', 'V1R8RvvXstpd', 'kFT81caNK3tP', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('pPviTOwgxyyM', 'LCX-K7WZXRd0', 'kFT81caNK3tP', 'made_by');

-- leonardo (1 pens)
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('j9pdtn9Fkjoq', 's0HAxT1gsHxh', 'g5r4udSOYhI5', 'made_by');

-- morrison (1 pens)
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('FSzODTOMBGkP', 'IKXbvQAJnW0p', 'tXa1mG6HXRJa', 'made_by');

-- noodlers (1 pens)
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('ck5Mvo6VGkBO', 'dLplUlM5weWq', '9gaEROr1PX3t', 'made_by');

-- opus88 (1 pens)
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('7G9AtDVPwdjj', 'dTCUDu03vrI6', 'I6tjleAZx9RU', 'made_by');

-- parker (22 pens)
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('iJRTXdt92gzI', 'SJDTGM9Ky7Cw', 'vhqNYqDChhiN', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('t7h2FaqRKE7Q', 'laT4tRN4DMOV', 'vhqNYqDChhiN', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('S7oyFDavebcl', 'rW2AMEFEdlZV', 'vhqNYqDChhiN', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('8n6342EINzar', 'tIro8i5PuBd1', 'vhqNYqDChhiN', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('w6AgDtchp1EV', 'SwlU6EcoNSIk', 'vhqNYqDChhiN', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('JQ6u3fErOjbx', 'sYO0meaAoJ_V', 'vhqNYqDChhiN', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('yAFzN04LmIAb', 'HDMg5J3JWOax', 'vhqNYqDChhiN', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('EjnqSrQ9s10y', 'pW1PSKiAUDK4', 'vhqNYqDChhiN', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('41odtb4JLFeU', 'wf8EzmU-iyFj', 'vhqNYqDChhiN', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('24Q3Siwz9Jp4', 'eB4bI7asypKz', 'vhqNYqDChhiN', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('RMa5FvPViZXf', 'sKkzyzTdeJAl', 'vhqNYqDChhiN', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('Qe4qZyA4byqT', '5dMSjdsBwJRd', 'vhqNYqDChhiN', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('Lt87n962ejeL', 'NwBRfVydmzxn', 'vhqNYqDChhiN', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('X9X9tSEXBcTg', 'jY3SP5ZX8Hwx', 'vhqNYqDChhiN', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('Q1N8oMagODad', 'h0ITYUHjOS3D', 'vhqNYqDChhiN', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('KK0hY8CmPVKf', 'jy_bRVs1hdMo', 'vhqNYqDChhiN', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('6UR2d88qhZjH', 'i_XH37icAI5C', 'vhqNYqDChhiN', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('m1NKhUJSZGUI', 'TFGZtGLytVIN', 'vhqNYqDChhiN', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('9vtNsSrbOebc', 'h8mHobX3YCPS', 'vhqNYqDChhiN', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('feJRMgaKjLMY', 'lmNEK_3PuF_t', 'vhqNYqDChhiN', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('aSlIXIch5R5s', 'nnagD4xc_3vG', 'vhqNYqDChhiN', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('H0QdBsMQOBli', 'ZxZjOj45mkq4', 'vhqNYqDChhiN', 'made_by');

-- skb (1 pens)
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('ntQJpZUQfCKM', '6K7UhGOj7VrS', 'z6qsxNL0PAj8', 'made_by');

-- sheaffer (13 pens)
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('LcKmhfCMtX0F', 'usCp8x8GbG-9', 'tVXnzDSFCcPP', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('P4k6fs3Asgcl', 'hbOcg60TD2lr', 'tVXnzDSFCcPP', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('En5tN7MK0VHB', 'qQbWP5zGOGSL', 'tVXnzDSFCcPP', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('XCwdsEmcMO9o', 'SLkj3_Y3o9pE', 'tVXnzDSFCcPP', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('KlggtEJqbHge', 'DfCvXoVXPG_n', 'tVXnzDSFCcPP', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('osJc9E951JDQ', 'pcft_zIm9kP9', 'tVXnzDSFCcPP', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('BxNQIQn3U1XZ', 'OxA3ZMr8ULNQ', 'tVXnzDSFCcPP', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('6dBheM7IeLtE', 'qVrtyA8zR6wk', 'tVXnzDSFCcPP', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('3GbpqyCxdpxK', 'dF7-4f3T1UHP', 'tVXnzDSFCcPP', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('TZYquXUQjEze', 'RmxZTCu-XMdN', 'tVXnzDSFCcPP', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('XAYkEZJ79unf', 'Hy122-S2-nlo', 'tVXnzDSFCcPP', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('pL8F1a12tlKY', '5JqrNzxFsWC6', 'tVXnzDSFCcPP', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('tiFDmer3QgYO', '_ELHatoNATQ4', 'tVXnzDSFCcPP', 'made_by');

-- chilton (3 pens)
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('R8hgy8tbgZwQ', 'Z4MD1UGwP8Hp', '6bBDoAc4ULKm', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('oYPJe5S9rUCF', 'Z_iJlYVZe21O', '6bBDoAc4ULKm', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('hJgX2k2jNfl8', '2XGqrpYS7j0c', '6bBDoAc4ULKm', 'made_by');

-- conklin (2 pens)
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('xEeY7Yqn1DtY', '_rGmelBGrtGm', '9UPHCybD7qAX', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('fQd6XyL1xFql', 'EMVPzAFzOnSJ', '9UPHCybD7qAX', 'made_by');

-- dunn (1 pens)
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('dYHKmyDwSMm7', 'Jfj3aTwb70wG', 'pwbUeoKAp7xI', 'made_by');

-- ingersoll (1 pens)
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('A6RwYicXG143', 'OwOqThACQI6M', '7ayTZUG4BVgU', 'made_by');

-- wasp (2 pens)
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('XT4d23TBX5ql', '5j4oXThfSHoz', '97fwqRaz02kE', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('SCz686pNaqKU', 'emvoh_r4BnJa', '97fwqRaz02kE', 'made_by');

-- wahl (1 pens)
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('317qoIRK0s2l', 'NbQ5cQ_jPBEO', 'aijX3l7Eed6N', 'made_by');

-- wearever (1 pens)
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('4oGrhTsUNes5', 'ZkG6VOvfGspq', 'x0PbAr6vvwf9', 'made_by');

-- tramol (1 pens)
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('dFWFZZYyGyxU', 'Yq-T86OfyarY', 'JhjxtpEQZx4g', 'made_by');

-- wancher (1 pens)
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('4KwmbuIAnWJl', '2aoD07lwSYCV', 'eOfD77nOeENN', 'made_by');

-- montblanc (6 pens)
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('dWxLkkGn6GuB', 'Eh5c49pldpwk', 'CJM8uLY0LmIX', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('6JNqaH1CcBh0', 'AOnijUblJc72', 'CJM8uLY0LmIX', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('7iolaUYUxoVP', 'C_eW3pcaf4yp', 'CJM8uLY0LmIX', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('alZYvorOSO4V', '91c7e6azUmK8', 'CJM8uLY0LmIX', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('CI3CW2rZLNyL', '1fojl5ZRSeua', 'CJM8uLY0LmIX', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('M2yQ5SOJMHjU', 'nOIr_Up5WcyJ', 'CJM8uLY0LmIX', 'made_by');

-- monteverde (1 pens)
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('uvFZtZSZ2Di2', 'ehhBLnGu6Uav', '2OpQMjam65SM', 'made_by');

-- twsbi (5 pens)
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('NGAOVrZDGpdc', 'V9IvGskSYan0', 'YTHuH8c3R9zl', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('O0Lk52RIJE9M', '4fJHjzNt8KfK', 'YTHuH8c3R9zl', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('VcAWLrqBjazr', 'X1jZgxCD4osm', 'YTHuH8c3R9zl', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('yEHUptiA9NPI', 'LRlvQscC9w-i', 'YTHuH8c3R9zl', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('AXauVi4X4hH5', '16So7O06Q6K1', 'YTHuH8c3R9zl', 'made_by');

-- shanghai (1 pens)
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('SXZ2Gxga52HY', 'A-m4SlNs1MJd', 'uppuHJzvuw5k', 'made_by');

-- dongwu (1 pens)
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('4KdHlx8Dvr9p', 'dbp20JATzwzm', 'v303FVWUV9sR', 'made_by');

-- nakaya (3 pens)
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('ylCUHXagxGyF', 'XRyAh9ESgAP9', 'qrZay1FxJDjd', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('qNnjKIbo1Yhk', 'yi6bQ5ulPD-W', 'qrZay1FxJDjd', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('5DSSHUOCq3Nu', 'YeodugzY82yu', 'qrZay1FxJDjd', 'made_by');

-- shule (1 pens)
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('hTfYJ1a2JnzL', 'p81bNOu9URb7', 'DnQI7CPpnewz', 'made_by');

-- yiren (1 pens)
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('M3rlGbG1ubq3', 'pJVODqR4jDGw', 'ncUFilOHTET2', 'made_by');

-- duke (1 pens)
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('NmYhacdcEdhv', '4lpmgqCxnJCs', '2Ay71LNqmFAb', 'made_by');

-- sailor (12 pens)
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('dW14rT2Mdbzr', 'uY3QLMSxlCoo', 'ce2dcqixqSCx', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('PIYNaE29VX05', 'OwE1TbVzfyQK', 'ce2dcqixqSCx', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('G1EME216qH0y', 'Ga6QpPQiF0YT', 'ce2dcqixqSCx', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('ER0dijlvtQfX', 'GXGa7rK83Jmi', 'ce2dcqixqSCx', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('kP1PaYUnlKvf', 'mSvIKpw1GsoS', 'ce2dcqixqSCx', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('aXql3F5nKsco', 'ouSQi7nqLzH5', 'ce2dcqixqSCx', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('mGzdC73uxwuX', 'MaxO_o9P4CXR', 'ce2dcqixqSCx', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('lwxHMz7SMpPE', 'lrpwJxiOfNNR', 'ce2dcqixqSCx', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('Ky9FGrr3Z2uz', 'VyZ6lMsgEeUo', 'ce2dcqixqSCx', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('M8SccqcFHOYD', '9jIF6QOt8wGr', 'ce2dcqixqSCx', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('XH3t1BHfSYMr', '67U-NLL0isp6', 'ce2dcqixqSCx', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('axvXJh93ogyV', 'sDaEy32aebxE', 'ce2dcqixqSCx', 'made_by');

-- lamy (6 pens)
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('ZyqPpDlJyiDV', 'JP1-DRoP6TOx', 'ySwGGq4bhvOA', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('v1iCs8zfRCmJ', 'kGBC759Anled', 'ySwGGq4bhvOA', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('VL1OrTVNPrmE', 'nS_nJKVzb_VP', 'ySwGGq4bhvOA', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('lGQk2SonHrXJ', 'aHnnbObkUsOe', 'ySwGGq4bhvOA', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('0ePo4sw0ATTI', 'w47-i3x_EADM', 'ySwGGq4bhvOA', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('zGIkShaC4erB', 'OyypWoezup4O', 'ySwGGq4bhvOA', 'made_by');

-- banju (1 pens)
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('SISGnhrydNDP', 'QkevxuduEm9F', 'S3JHYQtqJExx', 'made_by');

-- tangyue (1 pens)
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('DDQpFvUna2b9', 'zaXu3bnh1ith', 'FER68geLQkcJ', 'made_by');

-- penbbs (5 pens)
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('q2DOxY0i3og9', '6MSiaAQkLWEz', 'fXMP6pCWfPjq', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('t0abCya6Rx8p', '4T9PI9yulxvA', 'fXMP6pCWfPjq', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('qHmNacPf7sDZ', 'ZTVu5igxPOHe', 'fXMP6pCWfPjq', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('NzhoOmNKvuWA', 'ndYHaLW2Ezp_', 'fXMP6pCWfPjq', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('thTBKvRn4Mpp', 'NDr2-AGIGThf', 'fXMP6pCWfPjq', 'made_by');

-- saier (1 pens)
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('hyjyHs3TvqnO', 'q3zuCzJLQmZl', 'kBv3hmJfi366', 'made_by');

-- dagong (1 pens)
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('WrHvNptXJGjD', 'A8H1NwxfcPhT', 'vwSTpWgNYlPe', 'made_by');

-- aurora (1 pens)
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('1gZom9f9qNs7', 'G9ptvLpfyzNQ', 'CJXe8UpnkHLJ', 'made_by');

-- namiki (3 pens)
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('brgYBvVE3jIm', 'VZS9MQ7WtHev', 'lMGfoMjegnv8', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('U3RetGDyh3K9', 'RzscQ2aowvn4', 'lMGfoMjegnv8', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('Qs6DuDYmiT1e', 'rf4xDTwosdya', 'lMGfoMjegnv8', 'made_by');

-- hongdian (12 pens)
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('mxIOGSqr4Hpq', '1cA0oEMF7d1u', '4yRpvovXFoWh', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('7MZuMO2VL9He', 'BbfCEIAkG7C_', '4yRpvovXFoWh', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('yYZiRZN2yo42', '3Rkby4EUNPt0', '4yRpvovXFoWh', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('p1NlzZLHtK0B', 'bTFoxeal7c7T', '4yRpvovXFoWh', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('682q7Scn7Ael', 'WUzZY3Y3y7-1', '4yRpvovXFoWh', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('0IMlVB1TnYJW', 'CCUWJJaN7snC', '4yRpvovXFoWh', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('F6VrcJLWFH9z', 'w0IUT4Uk9LOb', '4yRpvovXFoWh', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('75t3WAg1c46J', 'SRGHDj0bD814', '4yRpvovXFoWh', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('NQgivMSpgKPp', 'F9Fb7joURlNH', '4yRpvovXFoWh', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('zoTRMAz6DqhV', 'km3uuSerw-AL', '4yRpvovXFoWh', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('b4yES2gx0B04', '_tLM8vJHVGyr', '4yRpvovXFoWh', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('R8p5VqIJFL9f', 'GOTYyfNxvLAE', '4yRpvovXFoWh', 'made_by');

-- delike (1 pens)
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('OxZM0gQpGN9H', '_gbRalCJARx3', '5AB8Cngbp1un', 'made_by');

-- yisihua (1 pens)
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('TVzRuqEQ4tIi', 'cVCGtVIb8WBd', 'mx3fnAnteiHS', 'made_by');

-- schneider (1 pens)
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('39h48MPsql6i', 'MilfdAoWAAJz', '4RLQzNpb6WbN', 'made_by');

-- mg (1 pens)
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('icJxDkVv2y8o', 'I4p37mxyOpqC', '70VSUqdIrGVc', 'made_by');

-- majohn (10 pens)
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('OJESprI5FBr8', '2wR-Ix08dC-F', 'TfXerdAZ5iWg', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('D01Ah6AcTtdW', '34paI0Z4d-Q6', 'TfXerdAZ5iWg', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('rxY6NnZp8AWt', 'jzMyPAQvAzeF', 'TfXerdAZ5iWg', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('XyCMwdLovztC', 'f1DaQYtCJVMk', 'TfXerdAZ5iWg', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('qFeqY430b8pj', 'GxLe3PSmZALi', 'TfXerdAZ5iWg', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('HMcmsJekOFu9', 'gC8zhkSOlQiH', 'TfXerdAZ5iWg', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('qu9O9AOgBs9p', 'FGW7K6dv4Dry', 'TfXerdAZ5iWg', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('hGmuD9XszjUi', '9Tb_A-lzzLOi', 'TfXerdAZ5iWg', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('LlWpjncPsPDt', 'CHLNJmZaZHB8', 'TfXerdAZ5iWg', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('nKtEsGzga84m', 'OKxZn-scQfN5', 'TfXerdAZ5iWg', 'made_by');

-- campus (1 pens)
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('4O1beiocsVW3', '6nwjVw9OWbpw', 'vkvhr34TkrUy', 'made_by');

-- picasso (1 pens)
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('0turrQyv8p0y', 'FZaeo2DF5_Qd', '5zbJPFGxfCXu', 'made_by');

-- wingsung (10 pens)
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('Cm5Oa6fHrPOa', 'GeaqwunJjrpS', '5WJw8padPmKF', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('Ula2Vph6HkWf', 'bV6wU3C9NxNi', '5WJw8padPmKF', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('6QrXZC1hQClX', 'sahAk7o8xVkj', '5WJw8padPmKF', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('1iVVxJg9NTAy', 'UIxLC4vsFU4T', '5WJw8padPmKF', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('P4jtpzGHBDjR', 'JyzeY3oQZxT4', '5WJw8padPmKF', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('amYjwy8e0Jhm', 'u7s4ejpej4hj', '5WJw8padPmKF', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('945bPKNCCtUt', 'YRFCyRuCvt5I', '5WJw8padPmKF', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('3OGU47wRXkl1', 'b5VFRaOVWE7C', '5WJw8padPmKF', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('Ey2YcPXsxjpm', 'lMq83WGl2qss', '5WJw8padPmKF', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('LJTNgkubCIxU', 'GQPZwNqA_iVT', '5WJw8padPmKF', 'made_by');

-- yongxu (1 pens)
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('L5kvvPn8Wbuv', '01F-xAGy6sDr', 'yTWZrIZnGyMx', 'made_by');

-- paili (1 pens)
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('UBreeueprwmG', 'ZmHH94j5tJQo', 'xGmfK8jpUCnX', 'made_by');

-- lanbitou (1 pens)
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('JbFVZE3XTo5x', 'v_9J04P6xdfo', 'O8u4aqylQqJ7', 'made_by');

-- platinum (7 pens)
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('LIezFqTiCTI3', 'ekPMWnot9inz', 'e51tJpejEkXY', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('kad2eJijdMQi', 'BoZ4C2WSqk0K', 'e51tJpejEkXY', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('tvedLyJyl6UZ', 'OOumUrtFoAqu', 'e51tJpejEkXY', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('3zG7ESdVS1JO', 'ogo1UmxmcXJT', 'e51tJpejEkXY', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('fIzZ7krBuptA', 'Er9lACPas9qm', 'e51tJpejEkXY', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('CQFuH9Ba8VV6', 'a1t4DNomp4Ge', 'e51tJpejEkXY', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('tUn99iHgNgAd', '7dEIl-3axPwa', 'e51tJpejEkXY', 'made_by');

-- snowhite (1 pens)
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('LHe7bSUZ48jq', 'ex6eI7i__J5s', 'dd8FyxqCoIUb', 'made_by');

-- pilot (18 pens)
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('hwiueN0uk0hL', 'oJyaQy9bEc8V', 'Zt-PbXkE7UHM', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('6IWV9yeB5Ppo', 'lOgSh4vuQsFK', 'Zt-PbXkE7UHM', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('u7dkxosOJ7m5', '2_L9OS-kqqQV', 'Zt-PbXkE7UHM', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('G2BD8Zsg8gp0', '2GM0UtshoSVw', 'Zt-PbXkE7UHM', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('WqNOWDTmyCWe', '1Dcfc2GsaaV4', 'Zt-PbXkE7UHM', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('DBXDKPtWTWCR', 'fuB0SU-om1z5', 'Zt-PbXkE7UHM', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('gdeaI7HOpLik', 'BM2fNJ2-fP0T', 'Zt-PbXkE7UHM', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('X3DDHcO13F6k', 'gtneqw804HyP', 'Zt-PbXkE7UHM', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('5amrAIPwSRPs', 'x9Ds3bsbFIx2', 'Zt-PbXkE7UHM', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('WO05sNFEKB5h', 'qYCN9Mhl_0UC', 'Zt-PbXkE7UHM', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('ul8AFmtjJqZO', 'xQ-15uqtdMGA', 'Zt-PbXkE7UHM', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('AP1GmRiOz7AY', '3bijtqhOXplP', 'Zt-PbXkE7UHM', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('ObEXWkb3JTzv', 'NpJibLHczSl9', 'Zt-PbXkE7UHM', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('R9DdjALcVBww', '-Oa7pDNi4UnI', 'Zt-PbXkE7UHM', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('Beaig08cNHQf', '4D3U7H1p61Qf', 'Zt-PbXkE7UHM', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('4TswGKGMqm3S', 'UrbBB-onjGnF', 'Zt-PbXkE7UHM', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('pnDEDK7tXk9c', 'U6w1BK0N4u0f', 'Zt-PbXkE7UHM', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('7Wrmq6XovsYR', '1dtEi80xLCZ1', 'Zt-PbXkE7UHM', 'made_by');

-- pelikan (10 pens)
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('PSJY9OMgqZVV', '6eXuisf9KiK5', 'VXUULuCOLOB1', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('odc1gJXct08T', 'U1FyHpt9jaE4', 'VXUULuCOLOB1', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('3tuVcDQ8AYHN', 'uLrDh27Q5Xne', 'VXUULuCOLOB1', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('A0by2w2jG7Ta', 'EF34ulVg8PSK', 'VXUULuCOLOB1', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('7aCsrVeqbFuG', 'MJHgkh3M-6MQ', 'VXUULuCOLOB1', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('BrEva7xucGC6', 'hO_QkEZd8uyh', 'VXUULuCOLOB1', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('nUdnR8secHD7', 'rKSjyWghpB8Y', 'VXUULuCOLOB1', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('Z3QHPNYHwxAz', '2muSiS2rOSd7', 'VXUULuCOLOB1', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('dLR2sgVNoy9I', 'wnzMt5lugvtc', 'VXUULuCOLOB1', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('eF1I5wATNbXi', '1UzrQA9Rrmqs', 'VXUULuCOLOB1', 'made_by');

-- visconti (3 pens)
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('i9O9Ex1sPLhT', 'sUx2X4ayCUdL', '5BZDt2fQusMf', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('BsadewxizAzJ', 'V-pqNGhhGDZb', '5BZDt2fQusMf', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('cfUw1j9tuYjw', 'eL1U08XLB3lS', '5BZDt2fQusMf', 'made_by');

-- hero (4 pens)
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('HjcGHuaHrLFb', 'PntUQE2bP4qf', 'LIfzzmbCfFPt', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('3BZQylV5YiNm', 'skqRmcjdowQg', 'LIfzzmbCfFPt', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('OOWnIYqeI7wF', 'T9E_wRGNepqk', 'LIfzzmbCfFPt', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('XuEx1N1ASuq3', 'eDbt5freEPtb', 'LIfzzmbCfFPt', 'made_by');

-- faber-castell (6 pens)
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('bheBLusRWnfg', 'FBaxbvx7xTbo', 'xVHzH0mMviM4', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('76EfW70abqy4', 'HhQgvkpTJhEc', 'xVHzH0mMviM4', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('sq3Em6TWcOLc', 'wMSXKOxA9s2X', 'xVHzH0mMviM4', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('oEwwhBIshd6x', 'iDvM2_w62N0C', 'xVHzH0mMviM4', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('iKwiXsEYxsI9', 'O4AI01LTE75r', 'xVHzH0mMviM4', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('OXvzSjDBq7HO', 'TDLhXLvIOq6p', 'xVHzH0mMviM4', 'made_by');

-- douwan (1 pens)
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('LUAtPj6SitUN', 'jOcjUk_JB-XK', 'CwfFGW5zsocf', 'made_by');

-- jinxing (1 pens)
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('LrB2VlOJENee', 'RWv0fTpEcwuL', 'u872EQEhnTzA', 'made_by');

-- jinhao (15 pens)
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('UZMAl9ESlSd2', 'ybN-vyW4nRbM', 'Yulxwu7PuQAU', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('kV24ZlmfkLKg', 'gAxOYWXf25TY', 'Yulxwu7PuQAU', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('iKPRbe09wuUM', 'LpJabRAW_0Pu', 'Yulxwu7PuQAU', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('Syvl7KadC9O2', 'U8RkDxnXNxqo', 'Yulxwu7PuQAU', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('A1ViqLBudBCH', 'V3GOJ5Q1Ra9-', 'Yulxwu7PuQAU', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('RY394FZHffqL', 'czZTir9yNoeA', 'Yulxwu7PuQAU', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('N3kKNBFLrXka', 'dnrQK31VKUst', 'Yulxwu7PuQAU', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('l0r4JFaI3tuN', 'QDTizFrfcTbS', 'Yulxwu7PuQAU', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('rhGB1uD7vEWy', 'Y5hFEra6hHop', 'Yulxwu7PuQAU', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('70wkEqI1OKcO', 'jrBqng7RkdNS', 'Yulxwu7PuQAU', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('bTRSbdoYiYwg', 'CVSvZoIPB42k', 'Yulxwu7PuQAU', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('t93gl3FSSI3r', 'ymovp7E7NlEk', 'Yulxwu7PuQAU', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('PVzLepm8GJN7', 'mP8BPi8qUHSI', 'Yulxwu7PuQAU', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('uVpNPQqGVlpt', '8Zf3hoxCN0sv', 'Yulxwu7PuQAU', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('btYXx1QcB7qV', 'vspGwjDxROQ-', 'Yulxwu7PuQAU', 'made_by');

-- lily (1 pens)
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('aQMy9FQHfv7B', 'dinM62TunTr8', 'iBdg7LUlPdde', 'made_by');

-- zhangjiang (1 pens)
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('2o6zNgYG6B9n', 'fTRyXVmvdg58', 'mZNUfRureJsC', 'made_by');

-- cross (2 pens)
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('LN7tmmQhYrk2', 'q9hC7b9Q2RKZ', 'AcglIcVOba3Y', 'made_by');
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
  VALUES ('6LdTJFSXoYMb', 'NjUsoC-HoMM_', 'AcglIcVOba3Y', 'made_by');

-- Total made_by links: 254

-- ============================================================
-- PART 3: Create concept entities
-- ============================================================

INSERT OR IGNORE INTO entities (id, type, slug, name, summary, body_md)
  VALUES ('hJOlv6Y5oth2', 'concept', 'rotary-filler', '旋转上墨', '通过旋转笔尾机构驱动活塞或蜗杆吸墨的上墨方式，包括活塞上墨和蜗杆上墨', '旋转上墨是钢笔最常见的自带上墨方式之一。通过旋转笔尾的旋钮，驱动笔杆内的活塞或蜗杆机构运动，产生负压从墨水瓶中直接吸墨。优点是储墨量大（整支笔杆都是墨仓）、结构可靠。代表品牌有百利金（Pelikan）和 TWSBI。');
INSERT OR IGNORE INTO concept_rules (id, name, slug, description, conditions)
  VALUES ('8JwhUNCidZth', '旋转上墨', 'rotary-filler', '通过旋转笔尾机构驱动活塞或蜗杆吸墨的上墨方式，包括活塞上墨和蜗杆上墨', '[{"dimension": "fill_system", "tag_slug": "fill-piston"}, {"dimension": "fill_system", "tag_slug": "fill-worm"}]');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary, body_md)
  VALUES ('nbElcAgDbRRU', 'concept', 'vacuum-filler', '真空上墨', '利用大气压差一次性吸入大量墨水的上墨方式，储墨量最大', '真空上墨（Vacuum Filler）是储墨量最大的上墨方式。按下尾部按钮释放活塞，活塞弹回时产生强大负压，一次性吸入大量墨水。代表笔款是百乐 Custom 823。缺点是结构复杂、维修成本高。');
INSERT OR IGNORE INTO concept_rules (id, name, slug, description, conditions)
  VALUES ('NG95OChJKB6M', '真空上墨', 'vacuum-filler', '利用大气压差一次性吸入大量墨水的上墨方式，储墨量最大', '[{"dimension": "fill_system", "tag_slug": "fill-vacuum"}]');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary, body_md)
  VALUES ('b9V0JqOxpBPx', 'concept', 'eyedropper-filler', '滴入式上墨', '直接将墨水滴入笔杆腔体的最简单上墨方式，储墨量取决于笔杆容量', '滴入式上墨（Eyedropper）是最原始也最简单的上墨方式——拧开笔杆，用滴管直接将墨水注入笔杆腔体。储墨量理论上最大（整支笔杆都是墨仓），但容易漏墨和 burp（因温度变化导致墨水溢出）。常见于印度品牌和一些透明示范笔。');
INSERT OR IGNORE INTO concept_rules (id, name, slug, description, conditions)
  VALUES ('7Nfj4sk5Q7Dr', '滴入式上墨', 'eyedropper-filler', '直接将墨水滴入笔杆腔体的最简单上墨方式，储墨量取决于笔杆容量', '[{"dimension": "fill_system", "tag_slug": "fill-eyedropper"}]');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary, body_md)
  VALUES ('joUC4ZhCkmTh', 'concept', 'hooded-nib', '暗尖', '笔尖大部分被笔握包裹，只露出极小的书写部分，出墨稳定、不易干涸', '暗尖（Hooded Nib）是笔尖大部分被笔握包裹住的设计，只露出极小的书写部分。优点是出墨稳定、不容易干涸、书写角度宽容度高。代表笔款是派克 51 和英雄 616。缺点是缺乏弹性，无法体验笔尖的粗细变化。');
INSERT OR IGNORE INTO concept_rules (id, name, slug, description, conditions)
  VALUES ('BIHwaxFvekXd', '暗尖', 'hooded-nib', '笔尖大部分被笔握包裹，只露出极小的书写部分，出墨稳定、不易干涸', '[{"dimension": "nib_type", "tag_slug": "nib-hooded"}]');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary, body_md)
  VALUES ('vCvOFoDMsP8U', 'concept', 'open-nib', '明尖', '笔尖完全外露的经典设计，能看到完整的笔尖形状和刻字', '明尖（Open Nib / Exposed Nib）是笔尖完全外露的经典设计。能看到完整的笔尖形状、刻字和铱粒。书写时能体验笔尖的弹性和粗细变化。大多数中高端钢笔采用明尖设计。与暗尖相对。');
INSERT OR IGNORE INTO concept_rules (id, name, slug, description, conditions)
  VALUES ('n1GMfKFnwQyO', '明尖', 'open-nib', '笔尖完全外露的经典设计，能看到完整的笔尖形状和刻字', '[{"dimension": "nib_type", "tag_slug": "nib-open"}]');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary, body_md)
  VALUES ('bic3mrzjjpIp', 'concept', 'semi-hooded-nib', '半明尖', '介于明尖和暗尖之间的设计，笔尖部分外露，兼顾稳定性和弹性', '半明尖（Semi-Hooded Nib）是介于明尖和暗尖之间的设计，笔尖前端外露但根部被笔握部分包裹。兼顾了暗尖的出墨稳定性和明尖的书写弹性。代表笔款如弘典黑森林。');
INSERT OR IGNORE INTO concept_rules (id, name, slug, description, conditions)
  VALUES ('ByFtA5euPTEk', '半明尖', 'semi-hooded-nib', '介于明尖和暗尖之间的设计，笔尖部分外露，兼顾稳定性和弹性', '[{"dimension": "nib_type", "tag_slug": "nib-semi-hooded"}]');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary, body_md)
  VALUES ('rcyhCSbAfjM3', 'concept', 'gold-nib', '金尖', '含金合金制成的笔尖（14K/18K/21K），弹性好、书写有韧感', '金尖（Gold Nib）是含金合金制成的笔尖，常见规格有 14K（58.3%含金量）、18K（75%）、21K（87.5%）。金尖的优势是弹性好、书写有韧感、长期使用不易变形。含金量越高越软弹，但也越贵。是中高端钢笔的标配。');
INSERT OR IGNORE INTO concept_rules (id, name, slug, description, conditions)
  VALUES ('hikBYEHwLi07', '金尖', 'gold-nib', '含金合金制成的笔尖（14K/18K/21K），弹性好、书写有韧感', '[{"dimension": "nib_material", "tag_slug": "nib-gold"}]');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary, body_md)
  VALUES ('9vUWy7YhiL3W', 'concept', 'steel-nib', '钢尖', '不锈钢制成的笔尖，硬度高、成本低，入门笔标配', '钢尖（Steel Nib）是不锈钢制成的笔尖，硬度高、弹性小、成本低。入门级和中端钢笔普遍使用。现代钢尖工艺已经非常成熟，好的钢尖书写体验不输低端金尖。缺点是缺乏弹性和韧感。');
INSERT OR IGNORE INTO concept_rules (id, name, slug, description, conditions)
  VALUES ('2a1XSxegIdmI', '钢尖', 'steel-nib', '不锈钢制成的笔尖，硬度高、成本低，入门笔标配', '[{"dimension": "nib_material", "tag_slug": "nib-steel"}]');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary, body_md)
  VALUES ('sWKs7mBIQiuo', 'concept', 'titanium-nib', '钛尖', '钛合金制成的笔尖，硬度介于钢尖和金尖之间，有独特软弹感', '钛尖（Titanium Nib）是钛合金制成的笔尖，硬度和弹性介于钢尖和金尖之间。有独特的软弹书写感，比钢尖更有弹性但不如金尖顺滑。重量轻、耐腐蚀。弘典 T1 是代表笔款。');
INSERT OR IGNORE INTO concept_rules (id, name, slug, description, conditions)
  VALUES ('Kv6W7hrGemGO', '钛尖', 'titanium-nib', '钛合金制成的笔尖，硬度介于钢尖和金尖之间，有独特软弹感', '[{"dimension": "nib_material", "tag_slug": "nib-titanium"}]');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary, body_md)
  VALUES ('b91QvquyVqcU', 'concept', 'iridium-nib', '铱金尖', '钢尖尖端焊接铱粒的笔尖，耐磨性好，是性价比最高的选择', '铱金尖严格来说是钢尖的一种，在笔尖尖端焊接铱粒（实际多为铱合金或钌合金）以提高耐磨性。国内习惯将带铱粒的钢尖统称"铱金尖"。写乐 0501 铱金笔是典型代表。');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary, body_md)
  VALUES ('YZI44RlUJ8ZD', 'concept', 'italic-nib', '书法尖', '扁平状笔尖，写出有粗细变化的书法效果，适合西文书法', '书法尖（Italic / Stub Nib）是笔尖前端磨成扁平状的设计。横画细、竖画粗，写出有粗细变化的书法效果。Stub 尖较圆润适合日常，Italic 尖更方正需要一定技巧。适合西文书法和艺术书写。');
INSERT OR IGNORE INTO concept_rules (id, name, slug, description, conditions)
  VALUES ('dkNtb7oEQ1uE', '书法尖', 'italic-nib', '扁平状笔尖，写出有粗细变化的书法效果，适合西文书法', '[{"dimension": "nib_type", "tag_slug": "nib-italic"}]');

INSERT OR IGNORE INTO entities (id, type, slug, name, summary, body_md)
  VALUES ('WyduYwucVBCR', 'concept', 'music-nib', '音乐尖', '专为记谱设计的多叉笔尖，能写出极粗的线条', '音乐尖（Music Nib）是专为乐谱记谱设计的特殊笔尖，通常有两个或三个分叉的铱粒。能根据角度变化写出粗细不同的线条，适合画五线谱和写大字。白金和写乐有经典音乐尖产品。');
INSERT OR IGNORE INTO concept_rules (id, name, slug, description, conditions)
  VALUES ('zHetYdcqVbPt', '音乐尖', 'music-nib', '专为记谱设计的多叉笔尖，能写出极粗的线条', '[{"dimension": "nib_type", "tag_slug": "nib-music"}]');

-- Total new concept entities: 12
-- Existing concept (活塞上墨): _7v4D-P_Knpe

-- ============================================================
-- PART 4: Restore reverse-link triggers (may have been dropped)
-- ============================================================
CREATE TRIGGER IF NOT EXISTS trg_no_self_link
BEFORE INSERT ON entity_links
WHEN NEW.source_id = NEW.target_id
BEGIN
  SELECT RAISE(ABORT, 'Cannot create self-link');
END;

CREATE TRIGGER IF NOT EXISTS trg_link_reverse_insert
AFTER INSERT ON entity_links
WHEN NEW.link_type != 'reverse'
BEGIN
  INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type, created_at)
  VALUES ('rev-' || NEW.id, NEW.target_id, NEW.source_id, 'reverse', NEW.created_at);
END;

CREATE TRIGGER IF NOT EXISTS trg_link_reverse_delete
AFTER DELETE ON entity_links
WHEN OLD.link_type != 'reverse'
BEGIN
  DELETE FROM entity_links WHERE id = 'rev-' || OLD.id;
END;

-- Backfill reverse links for made_by links created above
INSERT OR IGNORE INTO entity_links (id, source_id, target_id, link_type)
SELECT 'rev-' || id, target_id, source_id, 'reverse'
FROM entity_links WHERE link_type = 'made_by';

-- ============================================================
-- PART 5: Record migration
-- ============================================================
INSERT OR IGNORE INTO migrations (name, applied_at) VALUES ('009_brands_and_concepts', datetime('now'));
