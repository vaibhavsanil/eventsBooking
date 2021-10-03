import React from 'react';
import AuthContext from '../../context/auth-context';
import { NavLink } from 'react-router-dom';

import './MainNavigation.css';

const mainNavigation = (props) => (
  <AuthContext.Consumer>
    {(context) => {
      return (
        <header className="main-navigation">
          <div className="main-navigation__logo">
            <h1>EasyEvent</h1>
          </div>
          <nav className="main-navigation__items">
            <ul className="main-navigation__item">
              {!context.token && (
                <li>
                  <NavLink to="/auth">Authentication</NavLink>
                </li>
              )}

              <li>
                <NavLink to="/events">Events</NavLink>
              </li>

              {context.token && (
                <li>
                  <NavLink to="/bookings">Bookings</NavLink>
                </li>
              )}

              {context.token && (
                <li>
                  <button onClick={context.logout}>Logout</button>
                </li>
              )}
            </ul>
          </nav>
        </header>
      );
    }}
  </AuthContext.Consumer>
);

export default mainNavigation;
