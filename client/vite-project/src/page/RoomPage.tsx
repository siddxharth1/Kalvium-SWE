import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Socket } from 'socket.io-client';
import { Document, Page } from 'react-pdf';
import { pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();
import 'react-pdf/dist/Page/TextLayer.css';

interface RoomPageProps {
    socketRef: React.MutableRefObject<Socket | null>;
}

const RoomPage: React.FC<RoomPageProps> = ({ socketRef }) => {
    const { id } = useParams(); // Room ID from URL
    const [users, setUsers] = useState<{ id: string; username: string }[]>([]);
    const [message, setMessage] = useState<string>('');
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [pdfError, setPdfError] = useState<string | null>(null); // Track PDF loading error

    useEffect(() => {
        if (socketRef.current) {
            socketRef.current.emit('join_room', { roomName: id, username: 'User_' + Math.random().toString(36).substring(7) });

            socketRef.current.on('roomUsers', (users: { id: string; username: string }[]) => {
                setUsers(users);
            });

            socketRef.current.on('page_changed', (data: { pageNumber: number }) => {
                setPageNumber(data.pageNumber);
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

    const onDocumentLoadSuccess = ({ numPages }: { numPages: any }) => {
        setNumPages(numPages);
        setPdfError(null); // Reset any previous error on successful load
    };

    const onDocumentLoadError = (error: any) => {
        setPdfError('Failed to load PDF file. Please try again later.');
        console.error(error); // Log the error for debugging
    };

    const handleChangePage = (newPage: number) => {
        if (socketRef.current) {
            const newPageNumber = Math.max(1, newPage);

            if (isAdmin) {
                socketRef.current.emit('change_page', { roomName: id, pageNumber: newPageNumber });
            } else {
                setPageNumber(newPageNumber);
                socketRef.current.emit('page_changed', { roomName: id, pageNumber: newPageNumber });
            }
        }
    };


    const goToPrevPage = () => {
        const newPageNumber = pageNumber - 1 <= 1 ? 1 : pageNumber - 1;
        handleChangePage(newPageNumber);
    };

    const goToNextPage = () => {
        const newPageNumber = pageNumber + 1 >= (numPages || 1) ? (numPages || 1) : pageNumber + 1;
        handleChangePage(newPageNumber);
    };

    return (
        <div className="flex flex-col items-center h-full w-full p-4 bg-gray-100">
            <h2 className="text-3xl font-semibold text-gray-800 mb-4">Room Code: {id}</h2>
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <p className="text-lg font-medium text-gray-700 mb-2">Page Number: {pageNumber}</p>
                {isAdmin && <p className="text-green-600 font-bold mb-4">You are the Admin</p>}

                {/* Users list */}
                <div className="mb-4 border-t pt-4">
                    <h3 className="text-lg font-semibold text-gray-700">Users in Room:</h3>
                    <ul className="list-disc list-inside text-gray-600">
                        {users.map(user => (
                            <li key={user.id} className="text-sm">{user.username}</li>
                        ))}
                    </ul>
                </div>

                {/* PDF controls */}
                <div className="flex justify-between mb-4">
                    <button
                        onClick={goToPrevPage}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Prev
                    </button>
                    <button
                        onClick={goToNextPage}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    >
                        Next
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block ml-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>

                {/* PDF Viewer */}
                {pdfError ? (
                    <div className="text-red-500 text-sm font-medium">{pdfError}</div>
                ) : (
                    <div className="pdf-viewer">
                        <Document
                            file="https://www.sldttc.org/allpdf/21583473018.pdf"
                            onLoadSuccess={onDocumentLoadSuccess}
                            onLoadError={onDocumentLoadError}
                        >
                            <Page pageNumber={pageNumber} />
                        </Document>
                    </div>
                )}

                {/* Message Input */}
                <div className="flex mt-4">
                    <input
                        type="text"
                        className="flex-grow p-3 border rounded-l text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message"
                    />
                </div>
            </div>
        </div>
    );
};

export default RoomPage;