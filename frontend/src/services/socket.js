import { io } from 'socket.io-client';

const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) return import.meta.env.VITE_SOCKET_URL;
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:5000`;
  }
  return 'http://localhost:5000';
};

const SOCKET_URL = getSocketUrl();

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  transports: ['websocket', 'polling'],
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

export const joinStudentRoom = (studentId) => {
  if (studentId) {
    socket.emit('join_student_room', studentId);
  }
};

export const joinPassportRoom = (passportId) => {
  if (passportId) {
    socket.emit('join_passport_room', passportId);
  }
};
