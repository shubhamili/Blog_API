import { Server } from "socket.io";

let io;

export function initSocket(server) {
    if (io) return io;
    io = new Server(server, {
        cors: {
            origin: [
                "http://localhost:5173"
            ],
        }
    });


    io.on("connection", (socket) => {
        const { userId } = socket.handshake.query;

        if (userId) {
            socket.join(userId);
            console.log("socket joined room", userId);
        }

        socket.on("disconnect", (reason) => {
            console.log("User disconnected:", reason);
        })


    })


    return io;


}



export function getIO() {
    if (!io) throw new Error("socket not initialized, call initSocket (server) first")
    return io;
}