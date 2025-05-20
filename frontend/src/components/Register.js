import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    login: '',
    name: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  
  const { login, name, phone, password, confirmPassword } = formData;
  
  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const onSubmit = async (e) => {
    e.preventDefault();
    
    // Валидация
    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    
    if (password.length < 6) {
      setError('Пароль должен содержать не менее 6 символов');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const res = await axios.post('http://localhost:8000/api/users/register/', {
        login,
        name,
        phone,
        password
      });
      
      setSuccess('Регистрация прошла успешно! Перенаправление на страницу входа...');
      
      // Перенаправление на страницу входа через 2 секунды
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err) {
      setError(
        err.response && err.response.data
          ? Object.values(err.response.data).join(', ')
          : 'Ошибка при регистрации. Пожалуйста, попробуйте снова.'
      );
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="form-container">
      <h2 className="text-center">Регистрация</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
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
          <label htmlFor="name">Имя</label>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={onChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="phone">Телефон</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={phone}
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
        
        <div className="form-group">
          <label htmlFor="confirmPassword">Подтверждение пароля</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={onChange}
            required
          />
        </div>
        
        <button type="submit" className="btn btn-block" disabled={loading}>
          {loading ? 'Регистрация...' : 'Зарегистрироваться'}
        </button>
      </form>
      
      <div className="text-center mt-3">
        Уже есть аккаунт? <Link to="/login" className="link">Войти</Link>
      </div>
    </div>
  );
};

export default Register;
