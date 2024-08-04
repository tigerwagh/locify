document.addEventListener("DOMContentLoaded", function () {
  // Initialize the map
  const map = L.map("map").setView([0, 0], 2); // Center on the world map with zoom level 2

  // Set up the OSM layer
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  // Set up Socket.io connection
  const socket = io();

  socket.on("connect", () => {
    console.log("Connected to the server via Socket.io");

    // Request the user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const data = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          socket.emit("send-location", data); // Send location to the server
        },
        (error) => {
          console.error("Error getting location: ", error);
        },
        {
          enableHighAccuracy: true,
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  });

  // Handle location updates from the server
  const markers = {};
  socket.on("receive-location", (data) => {
    const { id, lat, lng } = data;
    if (markers[id]) {
      markers[id].setLatLng([lat, lng]);
    } else {
      markers[id] = L.marker([lat, lng]).addTo(map);
    }
    map.setView([lat, lng], 13); // Center the map on the new location
  });

  // Handle user disconnection
  socket.on("user-disconnected", (id) => {
    if (markers[id]) {
      map.removeLayer(markers[id]);
      delete markers[id];
    }
  });
});
