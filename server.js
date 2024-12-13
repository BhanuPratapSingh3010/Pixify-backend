const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const port = 3000;
app.use(express.json({ limit: '50mb' })); // Adjust as needed
app.use(express.urlencoded({ limit: '50mb', extended: true }));
// Import database connection
const connection = require('./db');
connection();

// Middleware for JSON parsing
app.use(express.json());

let user = new Map();

function addUser(userId, socketId) {
    if (!user.has(userId)) {
        user.set(userId, socketId);
    }
    return user;
}

function removeUser(socketId) {
    for (const [userId, id] of user.entries()) {
        if (id === socketId) {
            user.delete(userId);
            break;
        }
    }
}

io.on("connection", (socket) => {
    console.log("A user connected: ", socket.id);

    socket.on('addUser', (userId) => {
        console.log("User joined with ID: ", userId);
        addUser(userId, socket.id);
        console.log("Current users: ", Array.from(user.entries()));
    });

    socket.on('sendMessage', ({ text, sender, reciever }) => {
        console.log(`Message: ${text}, Sender: ${sender}, Receiver: ${reciever}`);
        if (user.has(reciever)) {
            const socketId = user.get(reciever);
            io.to(socketId).emit('getMessage', { sender, text });
        }
    });

    socket.on('disconnect', () => {
        console.log("User disconnected: ", socket.id);
        removeUser(socket.id);
        console.log("Updated user map: ", Array.from(user.entries()));
    });
});


// CORS Configuration
// app.use(cors({
//     origin: 'http://localhost:5173', // Allow only frontend origin
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
//     allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
//     credentials: true // Allow cookies if needed
// }));

// // Explicit handling of preflight requests
// app.options('*', cors({
//     origin: 'http://localhost:5173',
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
//     credentials: true
// }));

// Middleware for rendering EJS templates
app.set('view engine', 'ejs');

// Importing routes
const userRouter = require('./router/userRoute');
const productRouter = require('./router/postRoute');
const messageRouter = require('./router/messageRoute');

// Using routes
app.use('/user', userRouter);
app.use('/post', productRouter);
app.use('/message', messageRouter);
// Start the server
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
