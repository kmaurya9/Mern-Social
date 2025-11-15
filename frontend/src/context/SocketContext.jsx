import { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";
import { UserData } from "./UserContext";

// Use current domain in production, localhost in development
const EndPoint = window.location.hostname === 'localhost' 
  ? "http://localhost:3000" 
  : window.location.origin;

const SocketContext = createContext();

export const SocketContextProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user } = UserData();
  
  useEffect(() => {
    // Only connect if user exists and has an _id
    if (!user || !user._id) {
      return;
    }

    const newSocket = io(EndPoint, {
      query: {
        userId: user._id,
      },
    });

    setSocket(newSocket);

    newSocket.on("getOnlineUser", (users) => {
      setOnlineUsers(users);
    });

    return () => {
      newSocket && newSocket.close();
    };
  }, [user]);
  
  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

export const SocketData = () => useContext(SocketContext);
