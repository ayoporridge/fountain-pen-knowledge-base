import { createClient } from "@libsql/client";

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Image URLs from retailer CDNs (public product images)
const IMAGE_MAP = {
  // Pilot pens - from Goulet/JetPens CDN
  "百乐 Pilot Custom 823": "https://cdn11.bigcommerce.com/s-7e5n8i/images/stencil/1280x1280/products/37803/137067/Pilot_Custom_823_Amber__84870.1694542186.jpg",
  "百乐 Pilot Custom 74": "https://cdn11.bigcommerce.com/s-7e5n8i/images/stencil/1280x1280/products/37803/137067/Pilot_Custom_823_Amber__84870.1694542186.jpg",
  "百乐 Pilot Capless/Decimo": "https://cdn11.bigcommerce.com/s-7e5n8i/images/stencil/1280x1280/products/37803/137067/Pilot_Custom_823_Amber__84870.1694542186.jpg",
};

async function main() {
  // First, check if image_url column exists
  try {
    await db.execute("SELECT image_url FROM entities LIMIT 1");
    console.log("image_url column already exists");
  } catch {
    console.log("Adding image_url column...");
    await db.execute("ALTER TABLE entities ADD COLUMN image_url TEXT");
    console.log("Added image_url column");
  }

  // For now, let's add a placeholder approach:
  // Use Unsplash source API for generic pen images
  // These are freely available, high-quality fountain pen photos
  const unsplashImages = [
    "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=800&q=80", // fountain pen close-up
    "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80", // writing with pen
    "https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&q=80", // pen and notebook
  ];

  // Get all pen entities
  const pens = await db.execute(
    "SELECT id, name, slug FROM entities WHERE type = 'pen' ORDER BY created_at DESC"
  );
  console.log(`Found ${pens.rows.length} pen entities`);

  // Update pens with placeholder images (cycling through Unsplash images)
  let updated = 0;
  for (let i = 0; i < pens.rows.length; i++) {
    const pen = pens.rows[i];
    const imageUrl = unsplashImages[i % unsplashImages.length];
    
    await db.execute({
      sql: "UPDATE entities SET image_url = ? WHERE id = ?",
      args: [imageUrl, String(pen.id)],
    });
    updated++;
  }

  console.log(`Updated ${updated} pen entities with placeholder images`);
  
  // Show some results
  const sample = await db.execute(
    "SELECT name, image_url FROM entities WHERE type = 'pen' AND image_url IS NOT NULL LIMIT 5"
  );
  console.log("\nSample results:");
  for (const row of sample.rows) {
    console.log(`${row.name}: ${row.image_url}`);
  }
}

main().catch(console.error);
