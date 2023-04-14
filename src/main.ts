import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Server } from 'socket.io'

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist:true,
  }))
  const io = new Server(3001);
  io.on("connection", (socket) => {
    // send a message to the client
    setTimeout(() => {
      socket.emit("start_recording");
    }, 3000)
    
    setTimeout(() => {
      socket.emit("stop_recording");
    }, 6000)
  });
  await app.listen(3000);
}
bootstrap();
