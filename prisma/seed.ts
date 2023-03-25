import { PrismaClient } from '@prisma/client';
import {users} from './dummydata/users';
import {games} from './dummydata/games';
import {courts} from './dummydata/courts';
import {timeSlots} from './dummydata/timeSlots'
import {hasTimeSlots} from './dummydata/hasTimeSlots'
import {branches} from './dummydata/branches';
import {venues} from './dummydata/venues';

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
        hash: venueData.hash,
        managerFirstName: venueData.managerFirstName,
        managerLastName: venueData.managerLastName,
        managerEmail: venueData.managerEmail,
        managerPhoneNumber: venueData.managerPhoneNumber,
	description: venueData.description
      },
    });
  }

      // Create branches
      for (const branchData of branches) {
        await prisma.branch.create({
          data: {
            location: branchData.location,
            venue: { connect: { id: branchData.venueId } },
          },
        });
      }
  
      
    // Create time slots
    for (const timeSlotData of timeSlots) {
      await prisma.timeSlot.create({
        data: {
          startTime: timeSlotData.startTime,
          endTime: timeSlotData.endTime,

        },
      });
    }

    // Create courts
    for (const courtData of courts) {
      await prisma.court.create({
        data: {
          courtType: courtData.courtType,
          nbOfPlayers: courtData.nbOfPlayers,
          branch: { connect: { id: courtData.branchId } },
          price: courtData.price,
          rating: courtData.rating
        },
      });
    }

  // Create courts
  for (const hasTimeSlotData of hasTimeSlots) {
    await prisma.hasTimeSlot.create({
      data: {
        courtId: hasTimeSlotData.courtId,
        timeSlotId: hasTimeSlotData.timeSlotId
      },
    });
  }

      // Create games
  for (const gameData of games) {
    await prisma.game.create({
      data: {
        admin: { connect: { id: gameData.adminId }},
        date: new Date(gameData.date),
        duration: gameData.duration,
        court: { connect: { id: gameData.courtId } },
	status: "APPROVED",
        createdAt: new Date(gameData.createdAt),
        updatedAt: new Date(gameData.updatedAt),
      },
    });
  }

}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
