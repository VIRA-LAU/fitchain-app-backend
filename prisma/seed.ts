import { PrismaClient } from '@prisma/client';
import { users } from './dummydata/users';
import { games } from './dummydata/games';
import { courts } from './dummydata/courts';
import { timeSlots } from './dummydata/timeSlots';
import { branches } from './dummydata/branches';
import { venues } from './dummydata/venues';

const prisma = new PrismaClient();

async function main() {
  // Create users
  for (const user of users) {
    await prisma.user.create({
      data: user,
    });
  }

  // Create venues
  for (const venueData of venues) {
    await prisma.venue.create({
      data: {
        name: venueData.name,
        description: venueData.description,
      },
    });
  }

  // Create branches
  for (const branchData of branches) {
    await prisma.branch.create({
      data: {
        location: branchData.location,
        venue: { connect: { id: branchData.venueId } },
        latitude: branchData.latitude,
        longitude: branchData.longitude,
        hash: branchData.hash,
        managerFirstName: branchData.managerFirstName,
        managerLastName: branchData.managerLastName,
        email: branchData.email,
        phoneNumber: branchData.phoneNumber,
        emailVerified: branchData.emailVerified,
        allowsBooking: branchData.allowsBooking
      },
    });
  }

  // Create courts
  for (const courtData of courts) {
    await prisma.court.create({
      data: {
        name: courtData.name,
        courtType: courtData.courtType,
        nbOfPlayers: courtData.nbOfPlayers,
        branch: { connect: { id: courtData.branchId } },
        price: courtData.price,
        rating: courtData.rating,
      },
    });
  }

  // Create time slots
  for (const timeSlotData of timeSlots) {
    await prisma.timeSlot.create({
      data: {
        startTime: timeSlotData.startTime,
        endTime: timeSlotData.endTime,
        courtId: timeSlotData.courtId,
      },
    });
  }

  // Create games
  for (const gameData of games) {
    await prisma.game.create({
      data: {
        admin: { connect: { id: gameData.adminId } },
        court: { connect: { id: gameData.courtId } },
        status: 'APPROVED',
        startTime: gameData.startTime,
        endTime: gameData.endTime,
      },
    });
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
