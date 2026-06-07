import { createClient } from '@libsql/client';

const db = createClient({
  url: 'libsql://fpkg-arjoxu.aws-us-west-2.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3ODA4MjE1NTQsImlkIjoiMDE5ZWEwODYtYWEwMS03MWZiLTk2NjMtMGUzMTA2MGI2OTg1IiwicmlkIjoiNzg0YjIyNzEtYTExYy00ZThhLWEyYjYtMzNiMTBjMWM2YTk2In0.nulsmSgn7kpDZXSHDuVXTf-OeR8Ad5uCOcSAwUCmJqx4A3Q8uiqoUWpCWxZ8a656oZSgUn81dyNjxGhXQdwLCQ',
});

// Test basic queries
const entities = await db.execute('SELECT COUNT(*) as c FROM entities');
const tags = await db.execute('SELECT COUNT(*) as c FROM tags');
const pen = await db.execute("SELECT name, summary FROM entities WHERE slug = '百乐-pilot-custom-74'");

console.log('Entities:', entities.rows[0].c);
console.log('Tags:', tags.rows[0].c);
console.log('Sample pen:', pen.rows[0]);

// Test join
const penTags = await db.execute(`
  SELECT t.name, t.dimension 
  FROM entity_tags et 
  JOIN tags t ON et.tag_id = t.id 
  JOIN entities e ON et.entity_id = e.id 
  WHERE e.slug = '百乐-pilot-custom-74'
`);
console.log('Pen tags:', penTags.rows);
