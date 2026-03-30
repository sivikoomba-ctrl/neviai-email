const Database = require("better-sqlite3");
const path = require("path");
const crypto = require("crypto");

const dbPath = path.resolve(__dirname, "../dev.db");
const db = new Database(dbPath);

function cuid() {
  return "c" + crypto.randomBytes(12).toString("hex");
}

const now = new Date().toISOString();

db.exec("DELETE FROM Email; DELETE FROM Campaign; DELETE FROM Template;");

const templates = [
  { name: "Welcome Email", subject: "Welcome to {{company}}, {{name}}!", body: "Dear {{name}},\n\nWelcome to {{company}}! We're thrilled to have you on board.\n\nHere's what you can expect:\n- Personalized updates\n- Priority access to new features\n- Dedicated support\n\nBest regards,\nThe {{company}} Team", category: "welcome", variables: "name, company" },
  { name: "Follow-Up Email", subject: "Following Up, {{name}}", body: "Hi {{name}},\n\nI wanted to follow up on our recent conversation about {{dealTitle}}.\n\nWould you be available for a quick call this week?\n\nBest regards", category: "follow-up", variables: "name, dealTitle" },
  { name: "Promotional Offer", subject: "Exclusive Offer for {{name}}!", body: "Hi {{name}},\n\nWe have an exciting offer for {{company}} customers!\n\n- 20% off premium plan\n- Free onboarding\n- Extended trial\n\nDon't miss out!\n\nWarm regards,\nThe Sales Team", category: "promotional", variables: "name, company" },
  { name: "Meeting Request", subject: "Meeting Request: {{dealTitle}}", body: "Dear {{name}},\n\nI'd like to schedule a meeting about {{dealTitle}}.\n\nAvailable times:\n- Tuesday 2:00 PM\n- Wednesday 10:00 AM\n- Thursday 3:00 PM\n\nBest regards", category: "meeting", variables: "name, dealTitle" },
  { name: "Thank You Note", subject: "Thank You, {{name}}!", body: "Dear {{name}},\n\nThank you for choosing {{company}}! We truly appreciate your trust.\n\nIf there's anything we can do to help, please reach out.\n\nWith gratitude,\nThe {{company}} Team", category: "custom", variables: "name, company" },
];

const insertTemplate = db.prepare("INSERT INTO Template (id, name, subject, body, category, variables, isAiGenerated, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
for (const t of templates) {
  insertTemplate.run(cuid(), t.name, t.subject, t.body, t.category, t.variables, 0, now, now);
}

console.log("Email Seed complete: 5 templates created.");
db.close();
