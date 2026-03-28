import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import appContext from './AppContext';
import { toast } from 'react-toastify';

const SocketContext = createContext();

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const { subdomain } = useContext(appContext);
    const socketRef = useRef(null);

    useEffect(() => {
        if (!subdomain || subdomain === 'main') {
            return;
        }

        const socketUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

        // Create socket connection
        const newSocket = io(socketUrl, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 2000,
            reconnectionDelayMax: 10000,
            timeout: 10000,
        });

        socketRef.current = newSocket;
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Socket connected:', newSocket.id);
            setIsConnected(true);
            // Join subdomain room
            newSocket.emit('join-subdomain', subdomain);
        });

        newSocket.on('disconnect', () => {
            console.log('Socket disconnected');
            setIsConnected(false);
        });

        newSocket.on('connect_error', (error) => {
            console.warn('Socket connection error (will retry):', error.message);
            setIsConnected(false);
        });

        newSocket.on('attendance-update', (data) => {
            console.log('Attendance update received:', data);
            // Emit a custom event for attendance updates
            window.dispatchEvent(new CustomEvent('attendance-update', { detail: data }));
        });

        // Cleanup function
        return () => {
            if (newSocket) {
                newSocket.disconnect();
            }
        };
    }, [subdomain]);

    const value = {
        socket,
        isConnected,
        socketRef
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketContext;