import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';

interface RoomJoinProps {
    socketRef: React.MutableRefObject<Socket | null>;
}

const RoomJoin: React.FC<RoomJoinProps> = ({ socketRef }) => {
    const name = useRef<HTMLInputElement>(null);
    const roomId = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    const handleJoinRoom = (e: React.FormEvent) => {
        e.preventDefault();

        const userName = name.current?.value;
        const roomCode = roomId.current?.value;

        if (userName && roomCode) {
            socketRef.current = io('http://localhost:5000');

            socketRef.current.emit('join_room', { roomName: roomCode, username: userName });

            navigate(`/c/${roomCode}`);

            socketRef.current.on('message', (message: string) => {
                console.log(message);
            });
        } else {
            alert('Please enter both a name and room code.');
        }
    };

    return (
        <div className="flex justify-center items-center h-full">
            <form className="space-y-4" onSubmit={handleJoinRoom}>
                <div>
                    <label htmlFor="name" className="block text-lg">Display Name</label>
                    <input
                        className="text-black p-2 rounded"
                        type="text"
                        id="name"
                        ref={name}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="room" className="block text-lg">Room Code</label>
                    <input
                        className="text-black p-2 rounded"
                        type="text"
                        id="room"
                        ref={roomId}
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="w-full p-2 bg-blue-500 hover:bg-blue-700 text-white rounded"
                >
                    Join Room
                </button>
            </form>
        </div>
    );
};

export default RoomJoin;
