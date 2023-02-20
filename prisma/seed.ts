import { PrismaClient } from '@prisma/client';
import {users} from './dummydata/users';
import {games} from './dummydata/games';
import {courts} from './dummydata/courts';
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
  
    // Create courts
    for (const courtData of courts) {
      await prisma.court.create({
        data: {
          courtType: courtData.courtType,
          nbOfPlayers: courtData.nbOfPlayers,
          branch: { connect: { id: courtData.branchId } },
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