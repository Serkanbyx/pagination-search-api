const { getDatabase } = require("./database");

const CATEGORIES = [
  "Electronics",
  "Books",
  "Clothing",
  "Home & Garden",
  "Sports",
  "Toys",
  "Food & Beverages",
  "Health",
  "Automotive",
  "Music",
];

const ADJECTIVES = [
  "Premium",
  "Deluxe",
  "Compact",
  "Wireless",
  "Organic",
  "Vintage",
  "Modern",
  "Ultra",
  "Smart",
  "Eco-Friendly",
  "Portable",
  "Professional",
  "Classic",
  "Advanced",
  "Mini",
];

const NOUNS = [
  "Widget",
  "Gadget",
  "Tool",
  "Device",
  "Kit",
  "Set",
  "Pack",
  "Bundle",
  "System",
  "Module",
  "Adapter",
  "Controller",
  "Sensor",
  "Monitor",
  "Tracker",
];

const randomPick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomPrice = () => +(Math.random() * 500 + 1).toFixed(2);

const generateItems = (count) => {
  const items = [];
  for (let i = 0; i < count; i++) {
    const adj = randomPick(ADJECTIVES);
    const noun = randomPick(NOUNS);
    const category = randomPick(CATEGORIES);
    items.push({
      name: `${adj} ${noun} ${i + 1}`,
      category,
      price: randomPrice(),
      description: `High-quality ${adj.toLowerCase()} ${noun.toLowerCase()} in the ${category.toLowerCase()} category.`,
    });
  }
  return items;
};

const seed = () => {
  const db = getDatabase();
  const existing = db.prepare("SELECT COUNT(*) as count FROM items").get();

  if (existing.count > 0) {
    console.log(`Database already has ${existing.count} items. Clearing...`);
    db.prepare("DELETE FROM items").run();
  }

  const TOTAL_ITEMS = 500;
  const items = generateItems(TOTAL_ITEMS);

  const insert = db.prepare(
    "INSERT INTO items (name, category, price, description) VALUES (?, ?, ?, ?)"
  );

  const insertMany = db.transaction((items) => {
    for (const item of items) {
      insert.run(item.name, item.category, item.price, item.description);
    }
  });

  insertMany(items);
  console.log(`Seeded ${TOTAL_ITEMS} items into the database.`);
};

seed();
