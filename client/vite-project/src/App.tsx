import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import HomePage from './page/HomePage';
import RoomJoin from './page/RoomJoin';
import RoomPage from './page/RoomPage';

function App() {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return (
    <BrowserRouter>
      <div className="bg-gray-900 h-screen text-white">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/join" element={<RoomJoin socketRef={socketRef} />} />
          <Route path="/c/:id" element={<RoomPage socketRef={socketRef} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
