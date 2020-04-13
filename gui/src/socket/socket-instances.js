import io from "socket.io-client";

const VueLocalStorage = window.localStorage;
let clientSocketInstance;
let gameServerSocketInstance;
export const getClientSocketInstance = () => {
  if (!clientSocketInstance) {
    if (!VueLocalStorage.getItem("clientSocketUUID")) {
      VueLocalStorage.setItem(
        "clientSocketUUID",
        Math.random()
          .toString(36)
          .substring(7)
      );
    }
    clientSocketInstance = io(
      `${process.env.VUE_APP_SOCKET_URL}?socketUUID=${VueLocalStorage.getItem(
        "clientSocketUUID"
      )}`
    );
  }
  return clientSocketInstance;
};

export const getGameServerSocketInstance = () => {
  if (!gameServerSocketInstance) {
    if (!VueLocalStorage.getItem("gameServerSocketUUID")) {
      VueLocalStorage.setItem(
        "gameServerSocketUUID",
        Math.random()
          .toString(36)
          .substring(7)
      );
    }
    gameServerSocketInstance = io(
      `${process.env.VUE_APP_SOCKET_URL}?socketUUID=${VueLocalStorage.getItem(
        "gameServerSocketUUID"
      )}`
    );
  }
  return gameServerSocketInstance;
};
