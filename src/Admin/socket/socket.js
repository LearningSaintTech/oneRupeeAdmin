import { io } from 'socket.io-client';

const SOCKET_URL = 'https://main.learningsaint.com'; // Backend URL

console.log(`🛠️ [Socket Setup] Initializing Socket.IO client with URL: ${SOCKET_URL}`);

// Initialize Socket.IO client
const socket = io(SOCKET_URL, {
  autoConnect: false, // Prevent auto-connect; we'll connect manually
  transports: ['websocket', 'polling'], // Match backend transports
  withCredentials: true, // Allow credentials for CORS
});

// Log connection attempts
socket.on('connect', () => {
  console.log(`✅ [Socket] Successfully connected to WebSocket server, Socket ID: ${socket.id}`);
});

// Log connection errors
socket.on('connect_error', (error) => {
  console.error(`❌ [Socket] Connection error: ${error.message}`);
});

// Log reconnection attempts
socket.on('reconnect_attempt', (attempt) => {
  console.log(`🔄 [Socket] Reconnection attempt #${attempt}`);
});

// Log successful reconnection
socket.on('reconnect', (attempt) => {
  console.log(`✅ [Socket] Reconnected successfully after ${attempt} attempts`);
});

// Log reconnection failure
socket.on('reconnect_failed', () => {
  console.error(`❌ [Socket] Reconnection failed after maximum attempts`);
});

// Export the socket instance
export default socket;

console.log(`📦 [Socket Setup] Socket.IO client instance created`);