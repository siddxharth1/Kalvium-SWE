# PDF Room Viewer

This project is a collaborative PDF viewer that allows multiple users to view a PDF document together in real-time. Users can join a room using a unique room code and view the same page as other participants. An admin user has control over page navigation for all users in the room.

## Features

- **Real-Time PDF Viewing**: Users can join a room and view PDF pages in sync with others.
- **Admin Control**: The admin can control the page navigation for all users in the room.
- **User Management**: Displays a list of users in the room.

## Prerequisites

- [Node.js](https://nodejs.org/) installed on your machine.

## Setup and Run

### Client

1. **Navigate to the client directory**:

    ```bash
    cd client/vite-project
    ```

2. **Install dependencies**:

    ```bash
    npm install
    ```

3. **Start the client**:

    ```bash
    npm run dev
    ```

4. Open the browser and go to the provided URL (usually `http://localhost:3000`).

### Server

1. **Open a new terminal window**.

2. **Navigate to the server directory**:

    ```bash
    cd server
    ```

3. **Install dependencies**:

    ```bash
    npm install
    ```

4. **Start the server**:

    ```bash
    npm run dev
    ```

The server will start on `http://localhost:5000` or another specified port.

## Usage

1. Open the client URL in the browser.
2. Join a room by entering a unique room code in the URL, such as `http://localhost:3000/room/1234`.
3. Users joining the same room code will see the same PDF page.
4. The admin can control page navigation, which syncs with all users in the room.

## Technologies Used

- **React**: Frontend library
- **Socket.IO**: Real-time communication between client and server
