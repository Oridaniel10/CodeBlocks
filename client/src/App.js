import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LobbyPage from './LobbyPage';
import CodeBlockPage from './CodeBlockPage';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LobbyPage />} />
                <Route path="/codeblock/:id" element={<CodeBlockPage />} />
            </Routes>
        </Router>
    );
};

export default App;
