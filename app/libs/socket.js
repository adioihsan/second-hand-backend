const { Server } = require("socket.io");
const {
    sendReleaseProductPushNotification,
    sendNegotiationPushNotification
} = require("../libs/fcm");

let io;
let connectedUsers = [];

module.exports = {
    init: (server) => {
        io = new Server(server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST", "PUT", "DELETE"],
            },
        });

        io.on("connect", async (socket) => {
            console.log(`A user connected with id: ${socket.id}`)
            
            socket.on("start", (args) => {
                console.log(`START: ${args}`);
                if (args.userId) {
                    connectedUsers.push({ 
                        userId: args.userId,
                        socketId: socket.id,
                    });
                }
                console.log("Connected Users : ", connectedUsers)
            })

            socket.on("disconnect", (reason) => {
                console.log(`DISCONNECT`);
                connectedUsers = connectedUsers.filter(
                  (user) => user.socketId !== socket.id
                );
                        
                console.log("Connected Users :", connectedUsers);
            });

            socket.on("fcm", (args) => {
                if(!args.userId || !args.fcmToken) {
                    return;
                }
                const userIdx = connectedUsers.findIndex(
                    (user) => user.userId === args.userId
                );
                if(userIdx < 0) return

                connectedUsers[userIdx].fcmToken = args.fcmToken;
                console.log("Connected Users :", connectedUsers);

            })
        })
        
        return io;
        
    },
    getIO: () => {
        if (!io) {
          throw new Error("Socket Not Initialized");
        }
        return io;
    },
    sendReleaseProductNotification: (userId, productId) => {
        if (!io) {
            throw new Error("Socket Not Initialized");
        }
        const selectedUsers = connectedUsers.filter(
            (user) => user.userId == userId
        )
        console.log("user Id : ", userId)
        console.log(`User Selected : ${selectedUsers}`);

        if (selectedUsers.length > 0) {
            selectedUsers.forEach((user) => {
                io.to(user.socketId).emit("notification", [
                  "Ada notifikasi baru!",
                ]);
                if (user.fcmToken) {
                    sendReleaseProductPushNotification(user.fcmToken, productId);
                }
            });
        }
    },

    sendNegotiationNotification: (userId, negotiationId, status) => {
        if (!io) {
            throw new Error("Socket Not Initialized");
        }
        const selectedUsers = connectedUsers.filter(
            (user) => user.userId === userId
        )
        if (selectedUsers.length > 0) {
            selectedUsers.forEach((user) => {
                io.to(user.socketId).emit("notification", [
                  "Ada notifikasi baru!",
                ]);
                if (user.fcmToken) {
                    sendNegotiationPushNotification(user.fcmToken, negotiationId, status);
                }
            });
        }
    }
}