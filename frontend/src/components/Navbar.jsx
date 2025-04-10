import React from 'react'
import { Link } from 'react-router-dom'

const Navbar = () => {
    return (
        <nav className="navbar navbar-expand navbar-light bg-light">
            <ul className="nav navbar-nav">
                <li className="nav-item">
                    <Link className="nav-link" 
                    to="/" 
                    aria-current="page"
                    >home 
                    <span className="visually-hidden">(current)</span></Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link" to="/favorites">Important</Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link " to="/login">Logout</Link>
                </li>
            </ul>
        </nav>

    )
}

export default Navbar