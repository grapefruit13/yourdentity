importScripts("https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js");
importScripts(
  "https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js"
);

// Replace these with your own Firebase config keys...
const firebaseConfig = {
  apiKey: "AIzaSyDrUoph1tb6UeIPiEcUjyaolThcxWKbHy0",
  authDomain: "youthvoice-2025.firebaseapp.com",
  projectId: "youthvoice-2025",
  storageBucket: "youthvoice-2025.firebasestorage.app",
  messagingSenderId: "700631058497",
  appId: "1:700631058497:web:2160361e1c25bec8bf1ec0",
  measurementId: "G-HXQ41FTC7V",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );

  const link = payload.data?.link;
  const type = payload.data?.type;
  const relatedId = payload.data?.relatedId;

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "./logo.png",
    data: {
      url: link,
      type: type,
      relatedId: relatedId,
    },
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(function (clientList) {
        const notificationData = event.notification.data;
        const url = notificationData?.url;
        const type = notificationData?.type;
        const relatedId = notificationData?.relatedId;

        console.log("Notification data:", { url, type, relatedId });

        if (!url) {
          return;
        }

        const fullUrl = url.startsWith("http")
          ? url
          : `${self.location.origin}${url}`;

        for (const client of clientList) {
          if (client.url === fullUrl && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(fullUrl);
        }
      })
  );
});
