import { PrismaClient } from './generated/prisma'

const prisma = new PrismaClient()

async function main() {
    console.log("🌱 Seeding database...")

  // Users
  const user1 = await prisma.user.create({
    data: {
      name: "Gaurav Sarang",
      email: "gaurav@example.com",
      role: "USER",
      password_hash: "hashed_password_123",
      phone: "9503783937",
    },
  })

  const owner1 = await prisma.user.create({
    data: {
      name: "Harshu Owner",
      email: "owner@example.com",
      role: "OWNER",
      password_hash: "hashed_owner_pass",
      phone: "9876543210",
    },
  })

  // Stay
  const stay1 = await prisma.stay.create({
    data: {
      owner_id: owner1.id,
      name: "Sunrise Hostel",
      address: "Hyderabad, Telangana",
      latitude: 17.3850,
      longitude: 78.4867,
      facilities: {
        wifi: true,
        laundry: true,
        mess: true,
      },
      photos: [
        "https://placehold.co/600x400?text=Hostel+1",
        "https://placehold.co/600x400?text=Hostel+2",
      ],
    },
  })

  // Stay Rooms
  const stayRoom1 = await prisma.stayRoom.create({
    data: {
      stay_id: stay1.id,
      room_type: "DOUBLE",
      price: 5000,
      capacity: 2,
      facilities: {
        ac: true,
        attachedBathroom: true,
      },
      photos: [
        "https://placehold.co/600x400?text=Room+1",
      ],
    },
  })

  const stayRoom2 = await prisma.stayRoom.create({
    data: {
      stay_id: stay1.id,
      room_type: "SINGLE",
      price: 8000,
      capacity: 1,
      facilities: {
        ac: false,
        attachedBathroom: false,
      },
      photos: [
        "https://placehold.co/600x400?text=Room+2",
      ],
    },
  })

  // Review
  await prisma.reviews.create({
    data: {
      stay_id: stay1.id,
      user_id: user1.id,
      comment: "Nice hostel, very clean and friendly environment.",
      rating: 4,
    },
  })

  // RoomMatePost
  await prisma.roomMatePost.create({
    data: {
      user_id: user1.id,
      stay_id: stay1.id,
      description: "Looking for a roommate for a DOUBLE sharing room.",
      status: "OPENED",
      preferences: {
        gender: "ANY",
        non_smoker: true,
      },
    },
  })

  const allUsers = await prisma.user.findMany()
  console.log(allUsers)

  console.log("✅ Seeding completed!")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })