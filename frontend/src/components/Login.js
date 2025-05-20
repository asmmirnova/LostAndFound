import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [formData, setFormData] = useState({
    login: '',
    password: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  
  const { login, password } = formData;
  
  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const onSubmit = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    setError('');
    
    try {
      const res = await axios.post('http://localhost:8000/api/users/login/', {
        login,
        password
      });
      
      // Сохраняем токен и информацию о пользователе в localStorage
      localStorage.setItem('token', res.data.access);
      localStorage.setItem('refreshToken', res.data.refresh);
      localStorage.setItem('user', JSON.stringify({
        id: res.data.user_id,
        login: res.data.login
      }));
      
      // Перенаправление на главную страницу
      navigate('/');
      
    } catch (err) {
      setError(
        err.response && err.response.data
          ? Object.values(err.response.data).join(', ')
          : 'Неверный логин или пароль'
      );
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="form-container">
      <h2 className="text-center">Вход в систему</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="login">Логин</label>
          <input
            type="text"
            id="login"
            name="login"
            value={login}
            onChange={onChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Пароль</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={onChange}
            required
          />
        </div>
        
        <button type="submit" className="btn btn-block" disabled={loading}>
          {loading ? 'Вход...' : 'Войти'}
        </button>
      </form>
      
      <div className="text-center mt-3">
        Нет аккаунта? <Link to="/register" className="link">Зарегистрироваться</Link>
      </div>
    </div>
  );
};

export default Login;
