import express, { Request, Response } from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});
const PORT = process.env.PORT || 5000;

interface User {
  id: string;
  username: string;
}

const roomStates: Map<
  string,
  { pageNumber: number; users: User[]; adminSocketId: string }
> = new Map();

function updateRoomUsers(roomName: string) {
  const roomState = roomStates.get(roomName);
  if (roomState) {
    const roomUsers = roomState.users.map((user) => ({
      id: user.id,
      username: user.username,
    }));
    io.to(roomName).emit("roomUsers", roomUsers);
  }
}

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  socket.on(
    "join_room",
    ({ roomName, username }: { roomName: string; username: string }) => {
      socket.join(roomName);
      console.log(`User ${username} (${socket.id}) joined room: ${roomName}`);

      // Check if the room exists or create it
      if (!roomStates.has(roomName)) {
        roomStates.set(roomName, {
          pageNumber: 1,
          users: [],
          adminSocketId: socket.id, // Set this user as admin
        });
      }

      const roomState = roomStates.get(roomName);
      if (roomState) {
        const newUser: User = { id: socket.id, username };
        roomState.users.push(newUser);

        // Emit admin status to the joining user
        const isAdmin = socket.id === roomState.adminSocketId;
        socket.emit("admin_check", isAdmin); // Send isAdmin status to the user

        // Emit the list of users to all users in the room
        updateRoomUsers(roomName);
      }

      socket
        .to(roomName)
        .emit("message", `User ${username} has joined the room.`);
    }
  );

  socket.on(
    "change_page",
    ({ roomName, pageNumber }: { roomName: string; pageNumber: number }) => {
      const roomState = roomStates.get(roomName);
      if (roomState && socket.id === roomState.adminSocketId) {
        roomState.pageNumber = pageNumber;
        // Emit the page change to all users in the room
        io.to(roomName).emit("page_changed", { pageNumber });
        console.log(`Admin changed page to ${pageNumber} in room: ${roomName}`);
      }
    }
  );

  socket.on("message", ({ roomName, message }) => {
    const roomState = roomStates.get(roomName);
    const user = roomState?.users.find((user) => user.id === socket.id);
    if (user) {
      io.to(roomName).emit("message", {
        userId: user.id,
        username: user.username,
        text: message,
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    for (const [roomName, roomState] of roomStates.entries()) {
      const userIndex = roomState.users.findIndex(
        (user) => user.id === socket.id
      );
      if (userIndex !== -1) {
        const [removedUser] = roomState.users.splice(userIndex, 1);

        updateRoomUsers(roomName);

        socket
          .to(roomName)
          .emit("message", `User ${removedUser.username} has left the room.`);

        if (removedUser.id === roomState.adminSocketId) {
          io.to(roomName).emit("message", "The admin has left the room.");
        }

        if (roomState.users.length === 0) {
          roomStates.delete(roomName);
        }
        break;
      }
    }
  });
});

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, TypeScript with Express!");
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
