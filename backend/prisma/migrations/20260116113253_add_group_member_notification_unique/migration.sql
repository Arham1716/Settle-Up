/*
  Warnings:

  - A unique constraint covering the columns `[groupId,userId]` on the table `GroupMemberNotification` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "GroupInvite" ALTER COLUMN "expiresAt" SET DEFAULT now() + interval '7 days';

-- CreateIndex
CREATE UNIQUE INDEX "GroupMemberNotification_groupId_userId_key" ON "GroupMemberNotification"("groupId", "userId");
