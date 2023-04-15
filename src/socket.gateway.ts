import {
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

@WebSocketGateway(3001)
export class SocketGateway {
  @WebSocketServer()
  server: Server;

  handleConnection(
    client: Socket,
    ...args: any[]
  ) {
    console.log(`Client ${client.id} connected`);
  }
}
