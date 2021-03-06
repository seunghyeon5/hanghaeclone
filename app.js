const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRouter = require("./routes/user");
const likeRouter = require("./routes/like");
const marketRouter = require("./routes/market");
const conversationRoute = require('./routes/conversations');
const messageRoute = require('./routes/messages');
require("dotenv").config();
const SERVER_PORT = process.env.PORT;
const SOCKET_PORT = process.env.SOCKET_PORT;
//socket 통신을 위한 테스트 코드  1:23분 까지

//socket tag
const io = require('socket.io')(SOCKET_PORT,{
    cors:{
       // origin : 'http://localhost:3000',
        origin : "http://clonebunjang.s3-website.ap-northeast-2.amazonaws.com", // 출처 허용 옵션 (전부 허용)
        credential: 'true' // 사용자 인증이 필요한 리소스(쿠키 ..등) 접근
    },
});




mongoose.connect("mongodb+srv://wea9677:tmxkdlfl@cluster0.xmzro.mongodb.net/CloneProject", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));

const app = express();

app.use(express.json());

app.use(cors({ // CORS 모듈 실행
     origin : "http://clonebunjang.s3-website.ap-northeast-2.amazonaws.com",  
    // origin : "*", // 출처 허용 옵션 (전부 허용)
    credential: 'true' // 사용자 인증이 필요한 리소스(쿠키 ..등) 접근
}));


app.use('/api', express.urlencoded({ extended: false }),userRouter);
app.use('/conversations',conversationRoute);
app.use('/messages',messageRoute);
app.use('/like', express.urlencoded({ extended: false }),likeRouter);
app.use('/market', express.urlencoded({ extended: false }),marketRouter);

app.get('/', (req, res) =>{
    res.send('클론코딩 테스트 페이지')
});

//socket 통신을 위한 테스트 코드  1:23분 까지
//socket tag

io.on("connection",(socket)=>{
    console.log("a user connected.")
io.emit("welcome", "hello this is socket server");
})

//
let users = [];

const addUser = (userId,socketId) => {
    !users.some((user)=>user.userId === userId) &&
    users.push({userId,socketId});
};

const removeUser = (socketId) => {
    users = users.filter((user)=>user.socketId !== socketId);
};

const getUser = (userId) => {
    return users.find((user)=>user.userId === userId);
};

io.on('connection',(socket)=>{
    //when connect 
    console.log('a user connected.')  

    //take userId and socketId from user
    socket.on('addUser',userId => {
        addUser(userId,socket.id);
        io.emit('getUsers',users)
    })

    //send and get message
    socket.on('sendMessage', ({senderId, receiverId, text}) => {
        const user = getUser(receiverId);
        io.to(user.socketId).emit('getMessage',{
            senderId,
            text,
        });
    });

    //when disconnect
    socket.on('disconnect', () => {
        console.log('a user disconnected!');
        removeUser(socket.id);
        io.emit('getUsers',users);
    });
    
})

app.listen(SERVER_PORT, () => {
    console.log(SERVER_PORT, '포트로 서버가 켜졌어요!')
});