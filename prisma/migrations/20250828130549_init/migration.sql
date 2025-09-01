-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "email_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "otp" TEXT,
ADD COLUMN     "otp_expiry" TIMESTAMP(3);
