import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem('token') ? true : false;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header style={headerStyle}>
      <div className="container" style={containerStyle}>
        <h1 style={logoStyle}>Бюро находок</h1>
        <nav>
          <ul style={navStyle}>
            {isAuthenticated ? (
              <>
                <li style={navItemStyle}>
                  <Link to="/items" style={linkStyle}>
                    Объявления
                  </Link>
                </li>
                <li style={navItemStyle}>
                  <Link to="/lost-item" style={linkStyle}>
                    Я потерял
                  </Link>
                </li>
                <li style={navItemStyle}>
                  <Link to="/found-item" style={linkStyle}>
                    Я нашел
                  </Link>
                </li>
                <li style={navItemStyle}>
                  <Link to="/profile" style={linkStyle}>
                    Мой профиль
                  </Link>
                </li>
                <li style={navItemStyle}>
                  <button onClick={handleLogout} style={buttonStyle}>
                    Выйти
                  </button>
                </li>
              </>
            ) : (
              <>
                <li style={navItemStyle}>
                  <Link to="/login" style={linkStyle}>
                    Вход
                  </Link>
                </li>
                <li style={navItemStyle}>
                  <Link to="/register" style={linkStyle}>
                    Регистрация
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

const headerStyle = {
  backgroundColor: '#4285f4',
  color: 'white',
  padding: '10px 0',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  width: '100%',
  overflow: 'hidden'
};

const containerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 20px',
  boxSizing: 'border-box'
};

const logoStyle = {
  margin: 0,
  fontSize: '24px'
};

const navStyle = {
  display: 'flex',
  listStyle: 'none',
  margin: 0,
  padding: 0
};

const navItemStyle = {
  marginLeft: '20px'
};

const linkStyle = {
  color: 'white',
  textDecoration: 'none',
  fontWeight: 'bold'
};

const buttonStyle = {
  background: 'none',
  border: 'none',
  color: 'white',
  cursor: 'pointer',
  fontWeight: 'bold',
  fontSize: '16px'
};

export default Header;
