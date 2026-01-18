import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("💥 Starting database reset...");

  // 1️⃣ Delete all member notifications
  console.log("Deleting all GroupMemberNotifications...");
  await prisma.groupMemberNotification.deleteMany({});
  console.log("✅ GroupMemberNotifications deleted");

  // 2️⃣ Delete all invites
  console.log("Deleting all GroupInvites...");
  await prisma.groupInvite.deleteMany({});
  console.log("✅ GroupInvites deleted");

  // 3️⃣ Delete all group memberships
  console.log("Deleting all GroupMembers...");
  await prisma.groupMember.deleteMany({});
  console.log("✅ GroupMembers deleted");

  // 4️⃣ Delete all groups
  console.log("Deleting all Groups...");
  await prisma.group.deleteMany({});
  console.log("✅ Groups deleted");

  // 5️⃣ Delete all activities (new step)
  console.log("Deleting all Activities...");
  await prisma.activity.deleteMany({});
  console.log("✅ Activities deleted");

  // 6️⃣ Delete all users
  console.log("Deleting all Users...");
  await prisma.user.deleteMany({});
  console.log("✅ Users deleted");

  console.log("🎉 Database reset complete!");
}

main()
  .catch((e) => {
    console.error("❌ Error during reset:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
