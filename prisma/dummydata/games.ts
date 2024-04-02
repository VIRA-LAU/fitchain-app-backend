import { GameStatus } from "@prisma/client";

export const games = [
  {
    adminId: 1,
    courtId: 1,
    status: GameStatus.COMPLETE,
    isBooked: true,
    startTime: '2023-08-30T09:00:00.000Z',
    endTime: '2023-08-30T11:00:00.000Z',
  },
  {
    adminId: 1,
    courtId: 2,
    status: GameStatus.COMPLETE,
    isBooked: true,
    type: 'Football',
    startTime: '2023-09-02T13:30:00.000Z',
    endTime: '2023-09-02T15:00:00.000Z',
  },
];
