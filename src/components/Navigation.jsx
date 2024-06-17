import React from 'react';
import { Link } from 'react-router-dom';

const Navigation = () => {
    return (
        <nav>
            <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/todo">ToDo List</Link></li>
                <li><Link to="/candidatures">Table des candidatures</Link></li>
            </ul>
        </nav>
    );
}

export default Navigation;