import io from "socket.io-client";

export const clientAppSocketInstance = io(process.env.VUE_APP_SOCKET_URL);
