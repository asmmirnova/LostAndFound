import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const UserProfile = () => {
  const { login } = useParams();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const headers = {
          'Authorization': `Bearer ${token}`
        };
        
        // Получаем данные профиля пользователя
        const profileUrl = login 
          ? `http://localhost:8000/api/users/profile/${login}/`
          : 'http://localhost:8000/api/users/profile/';
        
        const profileResponse = await axios.get(profileUrl, { headers });
        setUser(profileResponse.data);
        
        // Получаем статистику пользователя
        const statsUrl = login 
          ? `http://localhost:8000/api/users/stats/${login}/`
          : 'http://localhost:8000/api/users/stats/';
        
        const statsResponse = await axios.get(statsUrl, { headers });
        setStats(statsResponse.data);
        
        // Получаем объявления пользователя
        const itemsUrl = login 
          ? `http://localhost:8000/api/users/items/${login}/`
          : 'http://localhost:8000/api/users/items/';
        
        const itemsResponse = await axios.get(itemsUrl, { headers });
        setItems(itemsResponse.data);
        
      } catch (error) {
        console.error('Ошибка при получении данных пользователя:', error);
        setError('Не удалось загрузить данные пользователя. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [login]);
  
  // Функция для отображения статуса объявления
  const getStatusName = (statusCode) => {
    const statusMap = {
      'active': 'Активно',
      'resolved': 'Решено',
      'closed': 'Закрыто'
    };
    
    return statusMap[statusCode] || statusCode;
  };
  
  // Функция для отображения типа объявления
  const getTypeName = (typeCode) => {
    const typeMap = {
      'lost': 'Потеряно',
      'found': 'Найдено'
    };
    
    return typeMap[typeCode] || typeCode;
  };
  
  // Функция для форматирования даты
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  };
  
  if (loading) {
    return (
      <div className="container text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </div>
        <p className="mt-2">Загрузка данных пользователя...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container my-5">
        <div className="alert alert-danger">{error}</div>
        <Link to="/items" className="btn btn-primary">Вернуться к списку объявлений</Link>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="container my-5">
        <div className="alert alert-warning">Пользователь не найден</div>
        <Link to="/items" className="btn btn-primary">Вернуться к списку объявлений</Link>
      </div>
    );
  }
  
  return (
    <div className="container my-4">
      {/* Профиль пользователя - компактный блок */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">
            <i className="bi bi-person-circle me-2"></i>
            Профиль пользователя
          </h5>
        </div>
        <div className="card-body">
          <div className="profile-container">
            <div className="profile-header">
              <div className="profile-username">
                <h2>{user.login}</h2>
                <div className="profile-badge">
                  <i className="bi bi-calendar-check me-1"></i>
                  Пользователь с {formatDate(user.created_at)}
                </div>
              </div>
            </div>
            
            <div className="profile-details">
              <div className="profile-detail-item">
                <div className="profile-icon">
                  <i className="bi bi-person"></i>
                </div>
                <div className="profile-detail-content">
                  <p className="profile-detail-label">Имя</p>
                  <p className="profile-detail-value">{user.name}</p>
                </div>
              </div>
              
              <div className="profile-detail-item">
                <div className="profile-icon">
                  <i className="bi bi-telephone"></i>
                </div>
                <div className="profile-detail-content">
                  <p className="profile-detail-label">Телефон</p>
                  <p className="profile-detail-value">{user.phone}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Статистика пользователя - компактный блок */}
      {stats && (
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-info text-white">
            <h5 className="mb-0">
              <i className="bi bi-bar-chart-fill me-2"></i>
              Статистика объявлений
            </h5>
          </div>
          <div className="card-body py-3">
            <div className="stats-container">
              <div className="stats-total">
                <h2>{stats.total_count}</h2>
                <p>Всего объявлений</p>
              </div>
              
              <div className="stats-details">
                <div className="stats-item">
                  <div className="stats-icon active">
                    <i className="bi bi-clock fs-5"></i>
                  </div>
                  <h3 className="stats-value">{stats.active_count}</h3>
                  <p className="stats-label">Активных</p>
                </div>
                
                <div className="stats-item">
                  <div className="stats-icon resolved">
                    <i className="bi bi-check-circle fs-5"></i>
                  </div>
                  <h3 className="stats-value">{stats.resolved_count}</h3>
                  <p className="stats-label">Найдено</p>
                </div>
                
                <div className="stats-item">
                  <div className="stats-icon closed">
                    <i className="bi bi-x-circle fs-5"></i>
                  </div>
                  <h3 className="stats-value">{stats.closed_count}</h3>
                  <p className="stats-label">Закрыто</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Список объявлений пользователя - на всю ширину */}
      <div className="card shadow-sm">
        <div className="card-header bg-success text-white">
          <h5 className="mb-0">
            <i className="bi bi-card-list me-2"></i>
            Объявления пользователя
          </h5>
        </div>
        <div className="card-body">
          {items.length > 0 ? (
            <div className="row g-4">
              {items.map(item => (
                <div key={item.id} className="col-md-4 mb-4">
                  <div 
                    className={`card h-100 ${
                      item.status === 'resolved' ? 'item-resolved' : 
                      item.status === 'closed' ? 'item-closed' : 
                      'item-active'
                    }`}
                    data-status-text={
                      item.status === 'resolved' 
                        ? (item.type === 'found' ? 'Владелец найден' : 'Вещь нашлась') 
                        : item.status === 'closed' 
                          ? 'Закрыто' 
                          : 'В поисках'
                    }
                  >
                    {item.status === 'resolved' && <div className="item-resolved-overlay"></div>}
                    {item.status === 'closed' && <div className="item-closed-overlay"></div>}
                    {item.status === 'active' && (
                      <div className="item-active-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                        </svg>
                      </div>
                    )}
                    <div className={`item-card-header ${item.type === 'lost' ? 'lost' : 'found'}`}>
                      <span>{getTypeName(item.type)}</span>
                      <span className="badge bg-light text-dark" style={{ visibility: 'hidden' }}>{getStatusName(item.status)}</span>
                    </div>
                    {item.images && item.images.length > 0 && (item.images[0].file_url || item.images[0].file) && (
                      <img
                        src={item.images[0].file_url || `http://localhost:8000${item.images[0].file}`}
                        alt={item.title}
                        className="item-card-img"
                      />
                    )}
                    
                    <div className="item-card-body">
                      <h5 className="item-card-title">{item.title}</h5>
                      <p className="item-card-description text-truncate">{item.description}</p>
                      
                      <div className="item-card-detail">
                        <div className="item-card-detail-label">Цвет:</div>
                        <div className="item-card-detail-value">{item.color}</div>
                      </div>
                      
                      <div className="item-card-detail">
                        <div className="item-card-detail-label">Дата:</div>
                        <div className="item-card-detail-value">{formatDate(item.date_event)}</div>
                      </div>
                      
                      <div className="item-card-detail">
                        <div className="item-card-detail-label">Место:</div>
                        <div className="item-card-detail-value">{item.location_event}</div>
                      </div>
                      
                      {item.reward && (
                        <div className="item-card-detail">
                          <div className="item-card-detail-label">Вознаграждение:</div>
                          <div className="item-card-detail-value reward">{item.reward} руб.</div>
                        </div>
                      )}
                      
                      {item.tags && item.tags.length > 0 && (
                        <div className="item-card-tags">
                          <div className="item-card-detail-label">Теги:</div>
                          <div>
                            {item.tags.map(tag => (
                              <span key={tag.id} className="item-card-tag">
                                {tag.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="item-card-footer">
                      <Link to={`/items/${item.id}`} className={`item-card-button ${item.type === 'found' ? 'found' : ''}`}>
                        <i className="bi bi-eye me-2"></i>
                        Подробнее
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="alert alert-info">
              У пользователя пока нет объявлений
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
