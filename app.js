const express = require("express")
const app = express()


app.use(express.json())

app.get("/",(req,res)=>{
    res.send("Hello World")
})

const server = app.listen(5000,()=> console.log("server running on 5000"))

const io = require("socket.io")(server,{
    cors:"*"
})

// io.on("connection",(socket)=>{
//     console.log(socket.id);
//     socket.on("message",(data)=>{
//         console.log(data)
//         // socket.emit("viewData",data)                     //send to same socket only
//         io.emit("viewData",data)                         //send to all sockets up
//         // io.except("").emit("niewData",data)              //send to all sockets except socket id specific
//         // socket.to("").emit("viewData",data)              //sennd to specific id Socket
//         // socket.broadcast.emit("viewData",data)              //send to all sockets up exept socket send
//     })
// })

let users = []
let chatMsg = []
io.on("connection",(socket)=>{
    // console.log(socket.id);
    socket.on("loginName",(user)=>{
        users.push({username:user,id:socket.id})
        // console.log(users);
        io.emit("showUsers",users)
        socket.on("sendMessage",(msg)=>{
            let currentUser = users.find((user)=>user.id == socket.id)
            chatMsg.push({user:currentUser.username,message:msg})
            io.emit("displayMsg",chatMsg)
            // console.log(chatMsg);
        })
    })
    socket.on("disconnect", () => {
        // console.log(socket.id);
        users = users.filter((user)=>user.id != socket.id)
        io.emit("showUsers",users)
        users.length == 0 ? chatMsg=[] : null
        // console.log(users.length);
    });
})