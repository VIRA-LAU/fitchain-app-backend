import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Expo } from 'expo-server-sdk';

@Injectable()
export class NotificationsService {
  private expo: Expo;
  constructor(private config: ConfigService) {
    this.expo = new Expo({
      accessToken: this.config.get('NOTIFICATIONS_TOKEN'),
    });
  }

  async sendNotification(
    pushTokens: string[],
    title: string,
    body: string,
    url: string = undefined,
  ) {
    // Create the messages that you want to send to clients
    let messages = [];
    for (let pushToken of pushTokens) {
      if (Expo.isExpoPushToken(pushToken))
        messages.push({
          to: pushToken,
          sound: 'default',
          title,
          body,
          data: { url },
        });
    }
    let chunks = this.expo.chunkPushNotifications(messages);
    let tickets = [];
    (async () => {
      for (let chunk of chunks) {
        try {
          let ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          console.error(error);
        }
      }
    })();
  }
}
