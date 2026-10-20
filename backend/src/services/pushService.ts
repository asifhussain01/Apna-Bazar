export interface PushMessagePayload {
  to: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: string;
  badge?: number;
}

export class PushService {
  private static EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

  /**
   * Send Expo push notification to target device tokens
   */
  public static async sendPushNotifications(
    tokens: string[],
    title: string,
    body: string,
    data: Record<string, any> = {}
  ): Promise<void> {
    if (!tokens || tokens.length === 0) return;

    // Filter valid Expo push tokens: ExponentPushToken[...] or ExpoPushToken[...]
    const validTokens = tokens.filter(
      t => typeof t === 'string' && (t.startsWith('ExponentPushToken[') || t.startsWith('ExpoPushToken['))
    );

    if (validTokens.length === 0) {
      console.log('[PushService] No valid Expo push tokens found');
      return;
    }

    const messages: PushMessagePayload[] = validTokens.map(token => ({
      to: token,
      sound: 'default',
      title,
      body,
      data
    }));

    try {
      // Chunk notifications in batches of 100 per Expo documentation
      const chunkSize = 100;
      for (let i = 0; i < messages.length; i += chunkSize) {
        const batch = messages.slice(i, i + chunkSize);
        const response = await fetch(this.EXPO_PUSH_URL, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(batch)
        });

        if (!response.ok) {
          const errText = await response.text();
          console.warn(`[PushService] Failed sending batch: ${response.status} - ${errText}`);
        } else {
          console.log(`[PushService] Dispatched ${batch.length} push notification(s)`);
        }
      }
    } catch (err) {
      // Background push failures must not crash or block the application
      console.error('[PushService] Error dispatching push notifications:', err);
    }
  }
}
