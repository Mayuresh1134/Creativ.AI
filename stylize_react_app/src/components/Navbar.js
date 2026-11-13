import React from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import tools from "../tools";

const Navbar = () => {
  const { pathname } = useLocation();
  const inStudio = tools.some((tool) => tool.path === pathname);

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="logo">
          Creativ<span className="logo-dot">.</span>AI
        </Link>
        <nav aria-label="Main">
          <ul className="nav-links">
            <li><NavLink to="/" end>Home</NavLink></li>
            <li>
              <Link to={tools[0].path} className={inStudio ? "active" : undefined}>Studio</Link>
            </li>
            <li><NavLink to="/about">About</NavLink></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
