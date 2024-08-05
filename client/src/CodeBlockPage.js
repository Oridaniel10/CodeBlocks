import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import hljs from 'highlight.js';
import 'highlight.js/styles/default.css';
import './style/CodeBlockPage.css';

const socket = io('http://localhost:5000'); //when deployed we need to change!!!!!

const CodeBlockPage = () => {
    const { id } = useParams(); // id from the url
    const navigate = useNavigate(); 
    const [codeBlock, setCodeBlock] = useState(null); 
    const [code, setCode] = useState(''); 
    const [role, setRole] = useState(null); // (mentor or student)
    const [message, setMessage] = useState(''); 

    useEffect(() => {
        // Fetch 
        axios.get(`http://localhost:5000/codeblocks/${id}`)
            .then(response => {
                setCodeBlock(response.data); // Store the code block in state
                setCode(response.data.code); // Store the code in state
            })
            .catch(error => {
                console.error('There was an error fetching the code block!', error); 
            });
    }, [id]);

    useEffect(() => {
        socket.emit('join', id); // Send join event with the code block id

        socket.on('role', (assignedRole) => {
            setRole(assignedRole); // Store the role in state
            if (assignedRole === 'mentor') {
                setMessage('Waiting for a student to join...'); // Display message to mentor
            }
        });

        socket.on('updateCode', (newCode) => {
            setCode(newCode); // Update the code in state
        });

        socket.on('clientCount', (count) => {
            console.log(`Room ${id} has ${count} clients`); 
            if (role === 'mentor' && count > 1) {
                setMessage('A student has joined the session!'); 
                setTimeout(() => setMessage(''), 3000); // 3 seconds
            }
        });

        if (role === 'student') {
            setMessage('Welcome, student have a good luck on your code review!'); // welcome message to student
            setTimeout(() => setMessage(''), 3000); // 3 seconds
        }

        return () => {
            socket.emit('leave', id); //index.js
        };
    }, [id, role]);

    useEffect(() => {
        hljs.highlightAll(); // Highlight the code syntax
    }, [code]);

    const handleCodeChange = (event) => {
        const newCode = event.target.value;
        setCode(newCode); // Update the code in state
        socket.emit('changeCode', { id, newCode }); // Send changeCode event with the new code to index.js that listening
    };

    const handleSave = () => {
        axios.put(`http://localhost:5000/codeblocks/${id}`, { code })
            .then(() => {
                setMessage('Code saved successfully'); 
                setTimeout(() => setMessage(''), 3000); // 3 seconds
            })
            .catch(error => {
                console.error('There was an error saving the code!', error); 
            });
    };

    if (!codeBlock) return <div>Loading...</div>; //  loading message if code block is not loaded yet

    return (
        <div className="codeblock-container">
            <h1>{codeBlock.title}</h1>
            <p>{role === 'mentor' ? 'You are the mentor ! You can only view the code.' : 'You are the student. You can edit the code.'}</p>
            {role === 'mentor' ? (
                <pre>
                    <code className="javascript">
                        {code}
                    </code>
                </pre>
            ) : (
                <textarea value={code} onChange={handleCodeChange} style={{ width: '100%', height: '300px' }} />
            )}
            <div className="buttons-container">
                <button onClick={() => navigate('/')}>Go Back</button>
                {role === 'student' && <button onClick={handleSave}>Save</button>}
            </div>
            {message && <p className="save-message">{message}</p>}
            <h2></h2>
        </div>
    );
};

export default CodeBlockPage;
