"use client";
import { useEffect, useState } from "react";
import io from "socket.io-client";
import UserInfo from "./views/UserInfo";
import styles from "./page.module.css";
import BingoCard from "./views/Card";
import WinnerOverlay from "./views/Winner";

export default function Home() {
  const [username, setUsername] = useState(undefined);
  const [table, setTable] = useState(undefined);
  const [tableConfirmed, setTableConfirmed] = useState(false);
  const [socket, setSocket] = useState(null);
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    const newSocket = io(`http://localhost:4000`, {
      autoConnect: false,
    });
    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
      newSocket.close();
    };
  }, [setSocket]);

  return (
    <div className={styles.main}>
      {(username === undefined || table === undefined) ? (
        <UserInfo
          socket={socket}
          setUsername={setUsername}
          setTable={setTable}
        />
      ) : (!winner) ? (
        <BingoCard 
          socket={socket} 
          table={table}
          setTable={setTable}
          setWinner={setWinner}
        /> 
      ) : (
        <WinnerOverlay 
          winner={winner} 
        />
      )}

      {/* {username &&
        table &&
        !tableConfirmed &&
        "Esperando confirmación de tabla"} */}
    </div>
  );
}
