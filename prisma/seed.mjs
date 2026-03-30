import { PrismaLibSql } from "@prisma/adapter-libsql";
import { fileURLToPath } from "url";
import path from "path";
const { PrismaClient } = await import("../src/generated/prisma/client.ts");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, "..", "dev.db");
const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.email.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.template.deleteMany();

  // Create Templates
  const welcomeTemplate = await prisma.template.create({
    data: {
      name: "Welcome Email",
      subject: "Welcome to {{company}} - Let's Get Started!",
      body: "Dear {{name}},\n\nWelcome to {{company}}! We're thrilled to have you on board.\n\nHere's what you can expect:\n- Personalized onboarding tailored to your needs\n- Access to our comprehensive resource library\n- A dedicated support team ready to assist you\n\nTo get started, simply log in to your dashboard and explore our features. If you have any questions, don't hesitate to reach out.\n\nWe're excited to be part of your journey!\n\nBest regards,\nThe {{company}} Team",
      category: "onboarding",
      variables: "{{name}}, {{company}}",
      isAiGenerated: false,
    },
  });

  const followUpTemplate = await prisma.template.create({
    data: {
      name: "Follow-Up Email",
      subject: "Following Up on Our Conversation, {{name}}",
      body: "Hi {{name}},\n\nI hope this message finds you well. I wanted to follow up on our recent conversation and see if you had any additional questions or thoughts.\n\nI believe there's a strong opportunity for us to collaborate, and I'd love to explore this further with you. Would you be available for a quick call this week?\n\nPlease let me know what time works best for you.\n\nLooking forward to hearing from you!\n\nBest regards",
      category: "follow-up",
      variables: "{{name}}",
      isAiGenerated: false,
    },
  });

  const promoTemplate = await prisma.template.create({
    data: {
      name: "Promotional Offer",
      subject: "Exclusive Offer for {{name}} - Don't Miss Out!",
      body: "Hi {{name}},\n\nWe have an exciting offer exclusively for you!\n\nFor a limited time, enjoy special access to our premium features at a discounted rate. This is our way of saying thank you for being a valued member of our community.\n\nWhat's included:\n- Full access to all premium tools\n- Priority customer support\n- Advanced analytics and reporting\n- Custom integrations\n\nThis offer expires at the end of the month, so act fast!\n\nWarm regards,\nThe {{company}} Team",
      category: "marketing",
      variables: "{{name}}, {{company}}",
      isAiGenerated: false,
    },
  });

  const meetingTemplate = await prisma.template.create({
    data: {
      name: "Meeting Request",
      subject: "Meeting Request: {{name}} - Let's Connect",
      body: "Dear {{name}},\n\nI'd like to schedule a meeting to discuss potential collaboration opportunities between our organizations.\n\nI have a few topics I'd like to cover:\n1. Current challenges and pain points\n2. How our solution can address your needs\n3. Next steps and timeline\n\nWould any of the following times work for you?\n- Tuesday at 2:00 PM\n- Wednesday at 10:00 AM\n- Thursday at 3:00 PM\n\nPlease let me know your preference or suggest an alternative time.\n\nBest regards",
      category: "outreach",
      variables: "{{name}}",
      isAiGenerated: false,
    },
  });

  await prisma.template.create({
    data: {
      name: "Custom Thank You",
      subject: "Thank You, {{name}}!",
      body: "Dear {{name}},\n\nI wanted to take a moment to express my sincere gratitude for your time and consideration.\n\nYour insights during our conversation were incredibly valuable, and I'm confident that we can achieve great things together.\n\nI'll follow up with the materials we discussed by end of this week. In the meantime, please don't hesitate to reach out if you need anything.\n\nThank you once again for your trust and partnership.\n\nWarmly,\nThe {{company}} Team",
      category: "relationship",
      variables: "{{name}}, {{company}}",
      isAiGenerated: true,
    },
  });

  // Create Campaign
  const campaign = await prisma.campaign.create({
    data: {
      name: "Q1 Product Launch",
      description: "Email campaign for the Q1 product launch targeting existing customers and leads",
      status: "draft",
      templateId: welcomeTemplate.id,
    },
  });

  // Create Emails
  const now = new Date();
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);

  await prisma.email.create({
    data: {
      crmContactId: "contact-001",
      contactName: "Sarah Johnson",
      contactEmail: "sarah.johnson@techcorp.com",
      subject: "Welcome to NeviAI - Let's Get Started!",
      body: "Dear Sarah,\n\nWelcome to NeviAI! We're thrilled to have you on board.\n\nWe noticed you signed up for our AI automation platform, and we want to make sure you get the most out of it from day one.\n\nHere's what I recommend:\n1. Complete your profile setup\n2. Explore the dashboard\n3. Try your first automation\n\nIf you need any help, our team is just an email away.\n\nBest regards,\nThe NeviAI Team",
      tone: "professional",
      status: "sent",
      sentAt: fiveDaysAgo,
      opened: true,
      openedAt: new Date(fiveDaysAgo.getTime() + 3 * 60 * 60 * 1000),
      campaignId: campaign.id,
      templateId: welcomeTemplate.id,
    },
  });

  await prisma.email.create({
    data: {
      crmContactId: "contact-002",
      contactName: "Michael Chen",
      contactEmail: "m.chen@innovate.io",
      subject: "Following Up on Our Demo Call",
      body: "Hi Michael,\n\nThanks for joining the demo yesterday. I hope you found it valuable.\n\nAs discussed, here are the key takeaways:\n- Our platform can automate up to 80% of your email workflows\n- Integration with your existing CRM is seamless\n- You'll see ROI within the first month\n\nI'd love to schedule a follow-up to address any questions. How does Thursday at 2 PM sound?\n\nCheers,\nAI Email Assistant",
      tone: "friendly",
      status: "sent",
      sentAt: threeDaysAgo,
      opened: true,
      openedAt: new Date(threeDaysAgo.getTime() + 1 * 60 * 60 * 1000),
      templateId: followUpTemplate.id,
    },
  });

  await prisma.email.create({
    data: {
      crmContactId: "contact-003",
      contactName: "Emily Rodriguez",
      contactEmail: "emily.r@globalfirm.com",
      subject: "Exclusive Early Access to NeviAI Pro",
      body: "Dear Emily,\n\nAs a valued member of our community, I'm pleased to offer you exclusive early access to NeviAI Pro.\n\nThis upgraded tier includes:\n- Advanced AI email composition\n- Campaign analytics dashboard\n- Priority support\n- Custom template builder\n\nThis offer is available for a limited time at 40% off the regular price.\n\nWould you like to learn more?\n\nSincerely,\nThe NeviAI Team",
      tone: "formal",
      status: "sent",
      sentAt: twoDaysAgo,
      opened: false,
      campaignId: campaign.id,
      templateId: promoTemplate.id,
    },
  });

  await prisma.email.create({
    data: {
      crmContactId: "contact-004",
      contactName: "David Park",
      contactEmail: "david.park@startup.co",
      subject: "Meeting Request: AI Automation Partnership",
      body: "Dear David,\n\nI'd like to schedule a meeting to discuss how NeviAI can help streamline your team's communication workflows.\n\nBased on our initial conversation, I believe we can:\n1. Reduce your email response time by 60%\n2. Automate repetitive follow-ups\n3. Improve customer engagement rates\n\nWould you be available this week for a 30-minute call?\n\nBest regards,\nAI Email Assistant",
      tone: "professional",
      status: "draft",
      campaignId: campaign.id,
      templateId: meetingTemplate.id,
    },
  });

  await prisma.email.create({
    data: {
      crmContactId: "contact-005",
      contactName: "Lisa Thompson",
      contactEmail: "lisa.t@enterprise.net",
      subject: "Quick Question About Your Email Workflows",
      body: "Hey Lisa,\n\nJust wanted to check in and see how things are going with your current email setup.\n\nWe've been hearing from a lot of teams in your space that manual email management is eating up too much time. If that resonates, I'd love to show you how we can help.\n\nNo pressure at all - just thought it might be useful!\n\nTalk soon,\nAI Email Assistant",
      tone: "casual",
      status: "draft",
    },
  });

  console.log("Seed data created successfully!");
  console.log("- 5 templates");
  console.log("- 1 campaign");
  console.log("- 5 emails (3 sent, 2 draft)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
