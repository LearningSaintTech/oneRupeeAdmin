import React, { createContext, useEffect, useCallback } from 'react';
import socket from './socket'; // Import the socket instance

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  // Function to initialize WebSocket connection
  const connectSocket = useCallback((adminId) => {
    if(!adminId){
      console.log("      localStorage.getItem",     localStorage.getItem("adminId"));
    }
    console.log(`🔗 [SocketContext] Initiating Socket.IO connection for adminId: ${adminId}, Timestamp: ${new Date().toISOString()}`);
    socket.connect();
    console.log(`📡 [SocketContext] Socket.IO connect() called, Timestamp: ${new Date().toISOString()}`);

    // Emit JOIN event with adminId after connection is established
    if (socket.connected) {
      console.log(`📤 [SocketContext] Socket already connected, emitting JOIN event with adminId: ${adminId}, Timestamp: ${new Date().toISOString()}`);
      socket.emit('join', adminId);
    } else {
      // Wait for connection before joining
      socket.once('connect', () => {
        console.log(`📤 [SocketContext] Socket connected, now emitting JOIN event with adminId: ${adminId}, Timestamp: ${new Date().toISOString()}`);
        socket.emit('join', adminId);
      });
    }

    // Handle socket connection events
    socket.on('connect', () => {
      console.log(`✅ [SocketContext] Connected to WebSocket server, Socket ID: ${socket.id}, Timestamp: ${new Date().toISOString()}`);
    });

    socket.on('disconnect', (reason) => {
      console.log(`❌ [SocketContext] Disconnected from WebSocket server, Reason: ${reason}, Timestamp: ${new Date().toISOString()}`);
    });

    socket.on('error', (error) => {
      console.error(`❌ [SocketContext] Socket error: ${error}, Timestamp: ${new Date().toISOString()}`);
    });

    // Handle internship letter events
    socket.on('request_internship_letter', (data) => {
      console.log(`📨 [SocketContext] Received internship letter request:`, data);
      // You can add notification logic here or dispatch to Redux
    });

    // Handle payment completed events
    socket.on('payment_completed', (data) => {
      console.log(`💰 [SocketContext] Received payment completed event:`, data);
      // You can add notification logic here or dispatch to Redux
      
      // Show browser notification if permission is granted
      if (Notification.permission === 'granted') {
        new Notification('Payment Completed', {
          body: `Payment completed for ${data.courseName} by ${data.userName}`,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'payment-completed',
          requireInteraction: true
        });
      }
    });
  }, []);

  // Function to disconnect socket
  const disconnectSocket = useCallback(() => {
    console.log(`🧹 [SocketContext] Cleaning up Socket.IO listeners and disconnecting, Timestamp: ${new Date().toISOString()}`);
    socket.off('connect');
    socket.off('disconnect');
    socket.off('error');
    socket.off('request_internship_letter');
    socket.off('payment_completed');
    socket.disconnect();
    console.log(`🔌 [SocketContext] Socket.IO disconnected, Timestamp: ${new Date().toISOString()}`);
  }, []);

  useEffect(() => {
    // Check for adminId on mount
    const adminId = localStorage.getItem('adminId');
    console.log(`🛠️ [SocketContext] Checking for adminId in localStorage: ${adminId || 'None'}, Timestamp: ${new Date().toISOString()}`);

    if (adminId) {
      connectSocket(adminId);
    }

    // Cleanup on unmount
    return () => {
      disconnectSocket();
    };
  }, [connectSocket, disconnectSocket]);

  return (
    <SocketContext.Provider value={{ socket, connectSocket, disconnectSocket }}>
      {children}
    </SocketContext.Provider>
  );
};