import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Home from './components/Home';
import ToDoList from './components/ToDoList';
import CandidatureTable from './components/CandidatureTable';
import Navigation from './components/Navigation';
import Footer from './components/Footer';

import './App.css';

function App() {
    return (
        <Router>
            <div className="App">
                <Navigation />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/todo" element={<ToDoList />} />
                    <Route path="/candidatures" element={<CandidatureTable />} />
                </Routes>
                <Footer />
            </div>
        </Router>
    );
}

export default App;