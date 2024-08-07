const express = require('express'); 
const http = require('http'); // Import the HTTP library
const mongoose = require('mongoose'); 
const cors = require('cors'); 
const dotenv = require('dotenv'); // Import the dotenv library
const { Server } = require('socket.io'); // Import the Socket.io library
const path = require('path');


dotenv.config();

// Create the Express app and HTTP server
const app = express();
const server = http.createServer(app); //http server using the Express app
const io = new Server(server, { // create a new Socket.io server
    cors: {
        origin: "https://codeblocks-front-wncy.onrender.com", // allow requests from this origin
        methods: ["GET", "POST"] 
    }
});

const PORT = process.env.PORT || 5000; 

// CORS and JSON middleware
app.use(cors()); 
app.use(express.json()); 

// Connect to MongoDB database
mongoose.connect("mongodb+srv://orizxzx:ori123@moveotaskcluster.ieep98b.mongodb.net/CodeBlocks?retryWrites=true&w=majority", {
    useNewUrlParser: true, 
    useUnifiedTopology: true, 
}).then(() => {
    console.log('Connected to MongoDB :)'); 
}).catch(err => {
    console.error('Could not connect to MongoDB : ', err); 
});

// Import routes
const codeBlockRoutes = require('./routes/codeBlockRoutes'); 
app.use('/codeblocks', codeBlockRoutes); // Use the code block routes

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// track of mentors and clients by sockets
const roomState = {};

io.on('connection', (socket) => { 
    console.log('a user connected');

    socket.on('join', (room) => { 
        socket.join(room); 

        if (!roomState[room]) { // If the room does not exist yet
            roomState[room] = { mentor: null, clients: new Set() }; // Create a new room state
        }

        const roomClients = roomState[room].clients; // Get the clients in the room

        if (!roomState[room].mentor) { // If there is no mentor in the room
            roomState[room].mentor = socket.id; // Set the current client as the mentor
            socket.emit('role', 'mentor'); 
        } else {
            socket.emit('role', 'student'); 
        }

        roomClients.add(socket.id); // Add the client to the room's clients
        const clientCount = roomClients.size; 

        io.to(room).emit('clientCount', clientCount); 
    });

    socket.on('changeCode', ({ id, newCode }) => { // When a client changes the code
        io.to(id).emit('updateCode', newCode); 
    });

    socket.on('leave', (room) => { 
        socket.leave(room); 

        if (roomState[room]) { // If the room exists
            const roomClients = roomState[room].clients; 
            roomClients.delete(socket.id); 

            if (socket.id === roomState[room].mentor) { 
                roomState[room].mentor = null; // Remove the mentor from the room
            }

            const clientCount = roomClients.size; 
            io.to(room).emit('clientCount', clientCount); 

            if (clientCount === 0) { 
                delete roomState[room]; // Delete the room state
            }
        }
    });

    socket.on('disconnect', () => { // When a client disconnects
        console.log('user disconnected');

        for (const room in roomState) { 
            const roomClients = roomState[room].clients; 
            roomClients.delete(socket.id);

            if (socket.id === roomState[room].mentor) { // If the client was the mentor
                roomState[room].mentor = null; // Remove the mentor from the room
            }

            const clientCount = roomClients.size; // Get the number of clients in the room
            io.to(room).emit('clientCount', clientCount);

            if (clientCount === 0) { // If there are no clients left in the room
                delete roomState[room]; // Delete the room state
            }
        }
    });
});

server.listen(PORT, () => { 
    console.log(`Server is running on port ${PORT}`); 
});
