import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ItemList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    status: 'active',
    color: '',
    tags: '',
    search: '',
    offset: 0,
    limit: 10
  });
  const [totalCount, setTotalCount] = useState(0);
  const [availableTags, setAvailableTags] = useState([]);
  
  useEffect(() => {
    fetchItems();
    fetchTags();
  }, [filters]);
  
  const fetchItems = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const params = { ...filters };
      
      const response = await axios.get('http://localhost:8000/api/items/items/', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params
      });
      
      setItems(response.data.results);
      setTotalCount(response.data.count);
    } catch (error) {
      console.error('Ошибка при получении объявлений:', error);
      setError('Не удалось загрузить объявления. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchTags = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/items/tags/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setAvailableTags(response.data);
    } catch (error) {
      console.error('Ошибка при получении тегов:', error);
    }
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
      offset: 0
    });
  };
  
  const handleResetFilters = () => {
    setFilters({
      type: '',
      status: 'active',
      color: '',
      tags: '',
      search: '',
      offset: 0,
      limit: 10
    });
  };
  
  const handlePageChange = (newOffset) => {
    if (newOffset >= 0 && newOffset < totalCount) {
      setFilters({
        ...filters,
        offset: newOffset
      });
    }
  };
  
  const getColorName = (colorCode) => {
    const colorMap = {
      'red': 'Красный',
      'orange': 'Оранжевый',
      'yellow': 'Желтый',
      'green': 'Зеленый',
      'blue': 'Синий',
      'purple': 'Фиолетовый',
      'pink': 'Розовый',
      'brown': 'Коричневый',
      'black': 'Черный',
      'white': 'Белый',
      'gray': 'Серый',
      'gold': 'Золотой',
      'silver': 'Серебряный',
      'beige': 'Бежевый',
      'navy': 'Темно-синий',
      'teal': 'Бирюзовый',
      'olive': 'Оливковый',
      'maroon': 'Бордовый',
      'lime': 'Лаймовый',
      'aqua': 'Аквамарин',
      'coral': 'Коралловый',
      'magenta': 'Пурпурный',
      'cyan': 'Голубой',
      'lavender': 'Лавандовый',
      'salmon': 'Лососевый',
      'tan': 'Загар',
      'khaki': 'Хаки',
      'indigo': 'Индиго',
      'turquoise': 'Бирюзовый',
      'violet': 'Фиалковый',
      'crimson': 'Малиновый',
      'plum': 'Сливовый',
      'chocolate': 'Шоколадный',
      'charcoal': 'Угольный',
      'cream': 'Кремовый',
      'mint': 'Мятный',
      'emerald': 'Изумрудный',
      'ruby': 'Рубиновый',
      'sapphire': 'Сапфировый',
      'amber': 'Янтарный'
    };
    
    return colorMap[colorCode] || colorCode;
  };
  
  const getStatusName = (statusCode) => {
    const statusMap = {
      'active': 'Активно',
      'resolved': 'Решено',
      'closed': 'Закрыто'
    };
    
    return statusMap[statusCode] || statusCode;
  };
  
  const getTypeName = (typeCode) => {
    const typeMap = {
      'lost': 'Потеряно',
      'found': 'Найдено'
    };
    
    return typeMap[typeCode] || typeCode;
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  };
  
  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Объявления</h2>
        <div>
          <Link to="/lost-item" className="btn btn-primary me-2">Я потерял</Link>
          <Link to="/found-item" className="btn btn-success">Я нашел</Link>
        </div>
      </div>
      
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-white">
          <div className="filters-header">
            <i className="bi bi-funnel-fill"></i>
            <h3>Фильтры</h3>
          </div>
        </div>
        <div className="card-body">
          <div className="filters-container">
            <div className="filters-section">
              <div className="filter-item">
                <div className="filter-label">Тип объявления</div>
                <select
                  id="type"
                  name="type"
                  className="filter-control"
                  value={filters.type}
                  onChange={handleFilterChange}
                >
                  <option value="">Все</option>
                  <option value="lost">Потерянные вещи</option>
                  <option value="found">Найденные вещи</option>
                </select>
              </div>
              
              <div className="filter-item">
                <div className="filter-label">Статус</div>
                <select
                  id="status"
                  name="status"
                  className="filter-control"
                  value={filters.status}
                  onChange={handleFilterChange}
                >
                  <option value="">Все</option>
                  <option value="active">Активные</option>
                  <option value="resolved">Решенные</option>
                  <option value="closed">Закрытые</option>
                </select>
              </div>
              
              <div className="filter-item">
                <div className="filter-label">Цвет</div>
                <select
                  id="color"
                  name="color"
                  className="filter-control"
                  value={filters.color}
                  onChange={handleFilterChange}
                >
                  <option value="">Все</option>
                  <option value="red">Красный</option>
                  <option value="orange">Оранжевый</option>
                  <option value="yellow">Желтый</option>
                  <option value="green">Зеленый</option>
                  <option value="blue">Синий</option>
                  <option value="purple">Фиолетовый</option>
                  <option value="pink">Розовый</option>
                  <option value="brown">Коричневый</option>
                  <option value="black">Черный</option>
                  <option value="white">Белый</option>
                  <option value="gray">Серый</option>
                  <option value="gold">Золотой</option>
                  <option value="silver">Серебряный</option>
                  <option value="beige">Бежевый</option>
                  <option value="navy">Темно-синий</option>
                  <option value="teal">Бирюзовый</option>
                  <option value="olive">Оливковый</option>
                  <option value="maroon">Бордовый</option>
                  <option value="lime">Лаймовый</option>
                  <option value="aqua">Аквамарин</option>
                  <option value="coral">Коралловый</option>
                  <option value="magenta">Пурпурный</option>
                  <option value="cyan">Голубой</option>
                  <option value="lavender">Лавандовый</option>
                  <option value="salmon">Лососевый</option>
                  <option value="tan">Загар</option>
                  <option value="khaki">Хаки</option>
                  <option value="indigo">Индиго</option>
                  <option value="turquoise">Бирюзовый</option>
                  <option value="violet">Фиалковый</option>
                  <option value="crimson">Малиновый</option>
                  <option value="plum">Сливовый</option>
                  <option value="chocolate">Шоколадный</option>
                  <option value="charcoal">Угольный</option>
                  <option value="cream">Кремовый</option>
                  <option value="mint">Мятный</option>
                  <option value="emerald">Изумрудный</option>
                  <option value="ruby">Рубиновый</option>
                  <option value="sapphire">Сапфировый</option>
                  <option value="amber">Янтарный</option>
                </select>
              </div>
            </div>
            
            <div className="filters-section">
              <div className="filter-item">
                <div className="filter-label">Теги (через запятую)</div>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  className="filter-control"
                  value={filters.tags}
                  onChange={handleFilterChange}
                  placeholder="Например: ключи, документы"
                />
              </div>
              
              <div className="filter-item">
                <div className="filter-label">Поиск</div>
                <input
                  type="text"
                  id="search"
                  name="search"
                  className="filter-control"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Поиск по названию, описанию или месту"
                />
              </div>
            </div>
            
            <div className="filter-tags">
              <div className="filter-label">Популярные теги:</div>
              <div className="filter-tags-container">
                {availableTags.slice(0, 10).map(tag => (
                  <span
                    key={tag.id}
                    className="filter-tag"
                    onClick={() => setFilters({...filters, tags: tag.name, offset: 0})}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="filter-actions">
              <button
                className="filter-button reset"
                onClick={handleResetFilters}
              >
                <i className="bi bi-arrow-counterclockwise me-2"></i>
                Сбросить фильтры
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </div>
          <p className="mt-2">Загрузка объявлений...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : items.length === 0 ? (
        <div className="alert alert-info">
          Объявления не найдены. Попробуйте изменить параметры фильтрации или создайте новое объявление.
        </div>
      ) : (
        <div className="row">
          {items.map(item => (
            <div key={item.id} className="col-md-6 col-lg-4 mb-4">
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
                
                {item.images && item.images.length > 0 && item.images[0].file && (
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
                    <div className="item-card-detail-value">{getColorName(item.color)}</div>
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
      )}
      
      {!loading && items.length > 0 && (
        <div className="d-flex justify-content-between align-items-center mt-4">
          <div>
            Показано {filters.offset + 1}-{Math.min(filters.offset + items.length, totalCount)} из {totalCount}
          </div>
          
          <div className="btn-group">
            <button
              className="btn btn-outline-primary"
              onClick={() => handlePageChange(filters.offset - filters.limit)}
              disabled={filters.offset === 0}
            >
              Предыдущая
            </button>
            
            <button
              className="btn btn-outline-primary"
              onClick={() => handlePageChange(filters.offset + filters.limit)}
              disabled={filters.offset + filters.limit >= totalCount}
            >
              Следующая
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemList;
