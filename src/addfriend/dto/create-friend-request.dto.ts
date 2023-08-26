import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateFriendRequestDto {
  @IsNumber()
  @IsNotEmpty()
  friendId: number;
}
