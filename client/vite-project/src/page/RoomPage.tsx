import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Socket } from 'socket.io-client';

interface RoomPageProps {
    socketRef: React.MutableRefObject<Socket | null>;
}

const RoomPage: React.FC<RoomPageProps> = ({ socketRef }) => {
    const { id } = useParams(); // Room ID from URL
    const [users, setUsers] = useState<{ id: string; username: string }[]>([]);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [message, setMessage] = useState<string>('');
    const [isAdmin, setIsAdmin] = useState<boolean>(false);

    useEffect(() => {
        if (socketRef.current) {
            socketRef.current.emit('join_room', { roomName: id, username: 'User_' + Math.random().toString(36).substring(7) });

            socketRef.current.on('roomUsers', (users: { id: string; username: string }[]) => {
                setUsers(users);
            });

            socketRef.current.on('page_changed', (data: { pageNumber: number }) => {
                setPageNumber(data.pageNumber)
            });


            socketRef.current.on('message', (message: string) => {
                console.log(message);
            });


            socketRef.current.on('admin_check', (isAdmin: boolean) => {
                setIsAdmin(isAdmin);
            });
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.off('roomUsers');
                socketRef.current.off('page_changed');
                socketRef.current.off('message');
                socketRef.current.off('admin_check');
            }
        };
    }, [id, socketRef]);

    const handleChangePage = (newPage: number) => {
        if (socketRef.current) {

            const newPageNumber = Math.max(1, newPage);

            if (isAdmin) {
                socketRef.current.emit('change_page', { roomName: id, pageNumber: newPageNumber });
            } else {
                setPageNumber(newPageNumber);
            }
        }
    };

    const handleSendMessage = () => {
        if (socketRef.current) {
            socketRef.current.emit('message', { roomName: id, message });
            setMessage('');
        }
    };

    return (
        <div className="flex flex-col justify-center items-center h-full">
            <h2 className="text-2xl">Room Code: {id}</h2>
            <p>Page: {pageNumber}</p>

            {/* Show the users in the room */}
            <div className="mt-4">
                <h3 className="text-lg">Users:</h3>
                <ul>
                    {users.map(user => (
                        <li key={user.id}>{user.username}</li>
                    ))}
                </ul>
            </div>
            {isAdmin && <p className="text-red-500">You are the admin</p>}
            {/* Page change controls (visible to all users) */}
            <div className="mt-4">
                <button
                    className="p-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                    onClick={() => handleChangePage(pageNumber + 1)}
                >
                    Next Page
                </button>
                <button
                    className="p-2 bg-red-500 text-white rounded hover:bg-red-700 ml-4"
                    onClick={() => handleChangePage(pageNumber - 1)}
                >
                    Previous Page
                </button>
            </div>

            {/* Send message input */}
            <div className="mt-4">
                <input
                    type="text"
                    className="p-2 text-black rounded"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Send a message"
                />
                <button
                    className="ml-2 p-2 bg-green-500 text-white rounded hover:bg-green-700"
                    onClick={handleSendMessage}
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default RoomPage;
