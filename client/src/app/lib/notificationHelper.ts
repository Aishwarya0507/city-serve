/**
 * Helper for managing PWA notifications.
 * Since a full Push API requires VAPID keys and server-side integration,
 * this helper provides robust local notifications and ground-work for push.
 */

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications.');
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

export const showLocalNotification = async (title: string, options?: NotificationOptions) => {
  if (Notification.permission !== 'granted') {
    const granted = await requestNotificationPermission();
    if (!granted) return;
  }

  // If a service worker is available, use it to show the notification
  // This is better for PWA behavior (shows even if tab is not active)
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    registration.showNotification(title, {
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      vibrate: [100, 50, 100],
      ...options,
    });
  } else {
    // Fallback to basic notification
    new Notification(title, options);
  }
};

/**
 * Simulates a booking notification
 */
export const notifyBookingConfirmed = (bookingId: string) => {
  showLocalNotification('Appointment Confirmed! 🎉', {
    body: `Your appointment #${bookingId.slice(-6).toUpperCase()} has been confirmed.`,
    tag: 'appointment-confirmed',
    data: { url: '/customer/bookings' }
  });
};

/**
 * Simulates a new message notification
 */
export const notifyNewMessage = (senderName: string, message: string) => {
  showLocalNotification(`New message from ${senderName}`, {
    body: message,
    tag: 'new-message',
    data: { url: '/customer/messages' } // Adjust based on your routing
  });
};
