import { io } from "socket.io-client";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

export const socket = io(BACKEND_URL, {
  withCredentials: true,
  autoConnect: false,
});
