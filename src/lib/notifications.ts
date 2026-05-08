/**
 * Notification System for Player Turn Alerts
 */

export interface RegisteredPlayer {
  deviceId: string;
  name: string;
  joinedAt: string;
}

/**
 * Send a browser notification to a specific device
 */
export function sendNotificationToDevice(deviceId: string, title: string, body: string) {
  if (!('Notification' in window)) {
    console.log('Notifications not supported');
    return;
  }

  if (Notification.permission === 'granted') {
    // Check if this is the current device
    const currentDeviceId = localStorage.getItem('device_id');
    if (currentDeviceId === deviceId) {
      new Notification(title, {
        body,
        icon: '/icon.png',
        badge: '/icon.png',
        tag: 'turn-alert',
        requireInteraction: true
      });
    }
  }
}

/**
 * Send notifications to all players in a match
 */
export function notifyMatchPlayers(teamA: string[], teamB: string[], registeredPlayers: RegisteredPlayer[]) {
  const allPlayerIds = [...teamA, ...teamB];
  
  allPlayerIds.forEach(playerId => {
    // Find registered player by matching with player data
    const registeredPlayer = registeredPlayers.find(rp => {
      // In a real implementation, you'd match playerId with the registered player's data
      // For now, we'll check if the registered player's name matches or use device ID
      return true; // Placeholder - needs proper matching logic
    });

    if (registeredPlayer) {
      sendNotificationToDevice(
        registeredPlayer.deviceId,
        'It\'s Your Turn!',
        `You have been selected for a match. Please proceed to the court.`
      );
    }
  });
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }

  if (Notification.permission !== 'denied') {
    return await Notification.requestPermission();
  }

  return Notification.permission;
}

/**
 * Check if notifications are enabled
 */
export function areNotificationsEnabled(): boolean {
  if (!('Notification' in window)) {
    return false;
  }
  return Notification.permission === 'granted';
}
