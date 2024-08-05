import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './style/LobbyPage.css'; 
import logo from './images/logo.png';


const LobbyPage = () => {
    const [codeBlocks, setCodeBlocks] = useState([]); 
    const [loading, setLoading] = useState(true); // State for loading status
    const [error, setError] = useState(null); 

    useEffect(() => {
        // Fetch code blocks from the server
        axios.get('http://localhost:5000/codeblocks')
            .then(response => {
                setCodeBlocks(response.data); 
                setLoading(false); // Set loading to false
            })
            .catch(error => {
                setError('There was an error fetching the code blocks!'); //  error message to state
                setLoading(false); 
            });
    }, []);

    if (loading) return <div>Loading...</div>; 
    if (error) return <div>{error}</div>;
    return (
        <div className="lobby-container">
            <div className="header">
            <img src={logo} alt="Logo" className="logo" /> 
            <div className="title-container">
                    <h1>Choose Code Block !</h1>
                    <h2>Code Review</h2> 
                </div>
            </div>
            <div className="codeblocks-container">
                {codeBlocks.length > 0 ? (
                    codeBlocks.map(block => (
                        <div key={block._id} className="codeblock-item">
                            <Link to={`/codeblock/${block._id}`} className="codeblock-link">
                                <h3>{block.title}</h3>
                            </Link>
                        </div>
                    ))
                ) : (
                    <div>No code blocks available - error </div> 
                )}
            </div>
        </div>
    );
};

export default LobbyPage;
