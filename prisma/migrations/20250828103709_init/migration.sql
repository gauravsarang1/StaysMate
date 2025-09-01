-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('USER', 'ADMIN', 'OWNER');

-- CreateEnum
CREATE TYPE "public"."Stay_Type" AS ENUM ('PG', 'Room', 'LATE_NIGHT', 'HOSTEL');

-- CreateEnum
CREATE TYPE "public"."Gender_Pref" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'ANY');

-- CreateEnum
CREATE TYPE "public"."Room_Status" AS ENUM ('AVAILABLE', 'BOOKED', 'UNAVAILABLE');

-- CreateEnum
CREATE TYPE "public"."Room_Type" AS ENUM ('SINGLE', 'DOUBLE', 'TRIPLE', 'MORE', 'DELUX');

-- CreateEnum
CREATE TYPE "public"."Room_Mate_Status" AS ENUM ('OPENED', 'CLOSED');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'USER',
    "password_hash" TEXT,
    "phone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Stay" (
    "id" SERIAL NOT NULL,
    "owner_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "facilities" JSONB NOT NULL,
    "photos" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StayRoom" (
    "id" SERIAL NOT NULL,
    "stay_id" INTEGER NOT NULL,
    "room_type" "public"."Room_Type" NOT NULL DEFAULT 'TRIPLE',
    "price" DOUBLE PRECISION NOT NULL,
    "capacity" INTEGER NOT NULL,
    "facilities" JSONB NOT NULL,
    "photos" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StayRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Reviews" (
    "id" SERIAL NOT NULL,
    "stay_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "rating" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RoomMatePost" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "stay_id" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "status" "public"."Room_Mate_Status" NOT NULL DEFAULT 'OPENED',
    "preferences" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoomMatePost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "public"."User"("phone");

-- AddForeignKey
ALTER TABLE "public"."Stay" ADD CONSTRAINT "Stay_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StayRoom" ADD CONSTRAINT "StayRoom_stay_id_fkey" FOREIGN KEY ("stay_id") REFERENCES "public"."Stay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Reviews" ADD CONSTRAINT "Reviews_stay_id_fkey" FOREIGN KEY ("stay_id") REFERENCES "public"."Stay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Reviews" ADD CONSTRAINT "Reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RoomMatePost" ADD CONSTRAINT "RoomMatePost_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RoomMatePost" ADD CONSTRAINT "RoomMatePost_stay_id_fkey" FOREIGN KEY ("stay_id") REFERENCES "public"."Stay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
