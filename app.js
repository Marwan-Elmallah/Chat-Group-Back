const express = require("express")
const app = express()

const port = process.env.PORT || 5000

app.use(express.json())

app.get("/", (req, res) => {
    res.send("Hello World")
})

const server = app.listen(port, () => console.log("server running on 5000"))

const io = require("socket.io")(server, {
    cors: "*"
})

let users = []
let chatMsg = []
let chatMsgPrivate = []
io.on("connection", (socket) => {
    // console.log(socket.id);
    socket.on("loginName", (user) => {
        users.push({ username: user, id: socket.id })
        // console.log(users);
        io.emit("showUsers", users)
        socket.on("sendMessage", (msg) => {
            let currentUser = users.find((user) => user.id == socket.id)
            chatMsg.push({ user: currentUser.username, message: msg })
            io.emit("displayMsg", chatMsg)
            // console.log(chatMsg);
        })
    })

    socket.on("chatWith", (id) => {
        // console.log(id, socket.id);
        let fromUser = users.find((user) => user.id == socket.id)
        let toUser = users.find((user) => user.id == id)
        socket.emit("showUser", toUser.username)

        socket.on("sendMessagePrivate", (msg) => {
            chatMsgPrivate.push({ user: fromUser.username, message: msg })
            toUser = users.find((user) => user.id == id)
            toUser ? null : chatMsgPrivate.push({ user: "SYSTEM", message: "User is Left Chat" })
            io.emit("displayMsgPrivate", chatMsgPrivate)
            // console.log(chatMsgPrivate);
            // console.log("User in", toUser);
        })
    })

    socket.on("disconnect", () => {
        console.log("close", socket.id);
        users = users.filter((user) => user.id != socket.id)
        io.emit("showUsers", users)
        if (users.length == 0) {
            chatMsg = []
            chatMsgPrivate = []
        }
        // console.log(users.length);
    });
})