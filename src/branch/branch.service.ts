import { ForbiddenException, Injectable } from '@nestjs/common';
import { Game, gameType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EditBranchDto } from './dto';
import { AWSS3Service } from 'src/aws-s3/aws-s3.service';

@Injectable()
export class BranchService {
  constructor(private prisma: PrismaService, private s3: AWSS3Service) {}

  async getBranches() {
    let branches = await this.prisma.branch.findMany({
      where: {
        courts: {
          some: {},
        },
      },
      select: {
        id: true,
        location: true,
        latitude: true,
        longitude: true,
        profilePhotoUrl: true,
        coverPhotoUrl: true,
        venue: {
          select: {
            name: true,
          },
        },
        courts: {
          select: {
            id: true,
            courtType: true,
            price: true,
            nbOfPlayers: true,
            rating: true,
            branchId: true,
            timeSlots: true,
          },
        },
      },
    });
    branches = branches
      .map((branch) => {
        branch.courts = branch.courts.filter(
          (court) => court.timeSlots.length !== 0,
        );
        return branch;
      })
      .filter((branch) => branch.courts.length !== 0);

    branches = branches.map((branch) => ({
      ...branch,
      rating:
        branch.courts.length > 0
          ? branch.courts
              .map((court) => court.rating)
              .reduce((a, b) => a + b, 0) / branch.courts.length
          : 0,
    }));
    return branches;
  }

  async getBranchById(branchId: number) {
    const branch = await this.prisma.branch.findUnique({
      where: {
        id: branchId,
      },
      select: {
        id: true,
        location: true,
        latitude: true,
        longitude: true,
        profilePhotoUrl: true,
        coverPhotoUrl: true,
        branchPhotoUrl: true,
        venue: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        courts: {
          select: {
            id: true,
            courtType: true,
            price: true,
            nbOfPlayers: true,
            rating: true,
            branchId: true,
          },
        },
      },
    });
    branch['rating'] =
      branch.courts.length > 0
        ? branch.courts
            .map((court) => court.rating)
            .reduce((a, b) => a + b, 0) / branch.courts.length
        : 0;
    return branch;
  }

  async getBranchesByVenueId(venueId: number) {
    let branches = await this.prisma.branch.findMany({
      where: {
        venueId,
      },
      select: {
        location: true,
        latitude: true,
        longitude: true,
        profilePhotoUrl: true,
        coverPhotoUrl: true,
        venue: {
          select: {
            id: true,
            name: true,
          },
        },
        courts: {
          select: {
            id: true,
            courtType: true,
            price: true,
            nbOfPlayers: true,
            rating: true,
            branchId: true,
          },
        },
      },
    });
    branches = branches.map((branch) => ({
      ...branch,
      rating:
        branch.courts.length > 0
          ? branch.courts
              .map((court) => court.rating)
              .reduce((a, b) => a + b, 0) / branch.courts.length
          : 0,
    }));
    return branches;
  }

  async getBookingsInBranch(branchId: number, date: Date) {
    return this.prisma.game.findMany({
      where: {
        court: {
          branchId,
        },
        date: {
          gte: new Date(date),
          lte: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000),
        },
      },
      orderBy: { date: 'asc' },
      select: {
        id: true,
        date: true,
        type: true,
        startTime: true,
        endTime: true,
        court: {
          select: {
            id: true,
            name: true,
          },
        },
        admin: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async searchForBranches(
    date: string,
    gameType: gameType,
    nbOfPlayers: number,
    startTime?: number,
    endTime?: number,
    branchId?: number,
  ) {
    if (typeof startTime !== 'undefined') {
      const timeSlots = await this.prisma.timeSlot.findMany({
        where: {
          OR: [
            {
              startTime: { lte: startTime },
              endTime: { gte: endTime },
            },
            {
              AND: [
                { startTime: { lte: startTime } },
                { endTime: { lte: endTime } },
                { endTime: { gte: startTime } },
              ],
            },
            {
              AND: [
                { startTime: { gte: startTime } },
                { startTime: { lte: endTime } },
                { endTime: { gte: endTime } },
              ],
            },
          ],
          court: {
            courtType: gameType,
          },
        },
      });
      const gamesInTimeSlots: Game[] = [];
      for (var timeSlot of timeSlots) {
        const gamesInTimeSlot = await this.prisma.game.findMany({
          where: {
            startTime: { gte: timeSlot.startTime },
            endTime: { lte: timeSlot.endTime },
            type: gameType,
            date: {
              gte: new Date(date),
              lte: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000),
            },
          },
        });
        gamesInTimeSlot.forEach((game) => {
          if (
            gamesInTimeSlots.findIndex(
              (existingGame) => existingGame.id === game.id,
            ) === -1
          )
            gamesInTimeSlots.push(game);
        });
      }
      const occupiedTimes = gamesInTimeSlots.map(
        ({ startTime, endTime, courtId }) => ({
          startTime,
          endTime,
          courtId,
        }),
      );
      let branches = await this.prisma.branch.findMany({
        where: {
          AND: [
            {
              courts: {
                some: {
                  timeSlots: {
                    some: {
                      id: {
                        in: timeSlots.map((slot) => slot.id),
                      },
                    },
                  },
                  courtType: gameType,
                  nbOfPlayers: { gte: nbOfPlayers },
                },
              },
            },
            branchId ? { id: branchId } : {},
          ],
        },
        select: {
          id: true,
          location: true,
          latitude: true,
          longitude: true,
          profilePhotoUrl: true,
          coverPhotoUrl: true,
          venue: {
            select: {
              id: true,
              name: true,
            },
          },
          courts: {
            where: {
              timeSlots: {
                some: {
                  id: {
                    in: timeSlots.map((slot) => slot.id),
                  },
                },
              },
              courtType: gameType,
              nbOfPlayers: { gte: nbOfPlayers },
            },
            select: {
              id: true,
              name: true,
              courtType: true,
              nbOfPlayers: true,
              price: true,
              rating: true,
              branchId: true,
              timeSlots: {
                where: {
                  id: { in: timeSlots.map((slot) => slot.id) },
                },
              },
            },
          },
        },
      });
      branches = branches.map((branch) => {
        branch.courts = branch.courts.map((court) => ({
          ...court,
          occupiedTimes: occupiedTimes.filter(
            ({ courtId }) => court.id === courtId,
          ),
        }));
        return branch;
      });

      branches = branches.map((branch) => ({
        ...branch,
        rating:
          branch.courts.length > 0
            ? branch.courts
                .map((court) => court.rating)
                .reduce((a, b) => a + b, 0) / branch.courts.length
            : 0,
      }));
      return branches;
    } else {
      const gamesInDate = await this.prisma.game.findMany({
        where: {
          date: {
            gte: new Date(date),
            lte: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000),
          },
          type: gameType,
        },
        select: {
          startTime: true,
          endTime: true,
          courtId: true,
        },
      });
      const occupiedTimes = gamesInDate.map(
        ({ startTime, endTime, courtId }) => ({
          startTime,
          endTime,
          courtId,
        }),
      );
      let branches = await this.prisma.branch.findMany({
        where: {
          AND: [
            {
              courts: {
                some: {
                  courtType: gameType,
                  nbOfPlayers: { gte: nbOfPlayers },
                },
              },
            },
            branchId ? { id: branchId } : {},
          ],
        },
        select: {
          id: true,
          location: true,
          latitude: true,
          longitude: true,
          profilePhotoUrl: true,
          coverPhotoUrl: true,
          venue: {
            select: {
              id: true,
              name: true,
            },
          },
          courts: {
            where: {
              courtType: gameType,
              nbOfPlayers: { gte: nbOfPlayers },
            },
            select: {
              id: true,
              name: true,
              courtType: true,
              price: true,
              nbOfPlayers: true,
              rating: true,
              branchId: true,
              timeSlots: true,
            },
          },
        },
      });
      branches = branches
        .map((branch) => {
          branch.courts = branch.courts.filter(
            (court) => court.timeSlots.length !== 0,
          );
          branch.courts = branch.courts.map((court) => ({
            ...court,
            occupiedTimes: occupiedTimes.filter(
              ({ courtId }) => court.id === courtId,
            ),
          }));
          return branch;
        })
        .filter((branch) => branch.courts.length !== 0);

      branches = branches.map((branch) => ({
        ...branch,
        rating:
          branch.courts.length > 0
            ? branch.courts
                .map((court) => court.rating)
                .reduce((a, b) => a + b, 0) / branch.courts.length
            : 0,
      }));
      return branches;
    }
  }

  async editBranchById(
    branchId: number,
    dto: EditBranchDto,
    images?: {
      profilePhoto?: Express.Multer.File[];
      coverPhoto?: Express.Multer.File[];
      branchPhotos?: Express.Multer.File[];
    },
  ) {
    if (images?.profilePhoto && images?.profilePhoto.length > 0) {
      const location = await this.s3.uploadFile(
        images.profilePhoto[0],
        `branchProfilePhotos`,
        images.profilePhoto[0].originalname,
      );
      dto.profilePhotoUrl =
        location + `?lastModified=${new Date().toISOString()}`;
    } else if (images?.coverPhoto && images?.coverPhoto.length > 0) {
      const location = await this.s3.uploadFile(
        images.coverPhoto[0],
        `branchCoverPhotos`,
        images.coverPhoto[0].originalname,
      );
      dto.coverPhotoUrl =
        location + `?lastModified=${new Date().toISOString()}`;
    } else if (images?.branchPhotos && images?.branchPhotos.length > 0) {
      const imageUrls = [];
      for (var image of images.branchPhotos) {
        const location = await this.s3.uploadFile(
          image,
          `branchPhotos`,
          image.originalname,
        );
        imageUrls.push(location + `?lastModified=${new Date().toISOString()}`);
      }

      var existingPhotos = [];
      const existing = await this.prisma.branch.findUnique({
        where: {
          id: branchId,
        },
        select: { branchPhotoUrl: true },
      });
      if (existing.branchPhotoUrl)
        existingPhotos = existing.branchPhotoUrl.split(',');

      dto.branchPhotoUrl = [...existingPhotos, ...imageUrls].join(',');
    }

    return await this.prisma.branch.update({
      where: {
        id: branchId,
      },
      data: {
        ...dto,
      },
    });
  }

  async deleteBranchById(branchId: number) {
    const branch = await this.prisma.branch.findUnique({
      where: {
        id: branchId,
      },
    });

    if (!branch) throw new ForbiddenException('Access to edit denied');

    await this.prisma.branch.delete({
      where: {
        id: branchId,
      },
    });
  }

  async deleteBranchPhoto(branchId: number, photoName: string) {
    const branch = await this.prisma.branch.findUnique({
      where: {
        id: branchId,
      },
      select: {
        branchPhotoUrl: true,
      },
    });

    if (!branch) throw new ForbiddenException('Access to edit denied');

    await this.s3.deleteFile('branchPhotos', photoName);

    var photoArr = branch.branchPhotoUrl.split(',');
    photoArr = photoArr.filter(
      (photo) => !photo.includes(photoName.split(':').join('%3A')),
    );

    await this.prisma.branch.update({
      where: {
        id: branchId,
      },
      data: {
        branchPhotoUrl: photoArr.join(','),
      },
    });
  }
}
