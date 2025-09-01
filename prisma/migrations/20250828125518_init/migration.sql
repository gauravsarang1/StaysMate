-- AlterTable
ALTER TABLE "public"."Stay" ALTER COLUMN "latitude" DROP NOT NULL,
ALTER COLUMN "longitude" DROP NOT NULL,
ALTER COLUMN "facilities" DROP NOT NULL,
ALTER COLUMN "photos" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."StayRoom" ALTER COLUMN "facilities" DROP NOT NULL,
ALTER COLUMN "photos" DROP NOT NULL;
