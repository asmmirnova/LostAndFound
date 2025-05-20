import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [statusChangeLoading, setStatusChangeLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [statusToChange, setStatusToChange] = useState(null);
  
  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:8000/api/items/items/${id}/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        setItem(response.data);
        
        const userData = JSON.parse(localStorage.getItem('user'));
        console.log('User data:', userData);
        console.log('Item owner:', response.data.user);
        if (userData && userData.login === response.data.user) {
          console.log('User is owner!');
          setIsOwner(true);
        } else {
          console.log('User is NOT owner');
          setIsOwner(false);
        }
      } catch (error) {
        console.error('Ошибка при получении объявления:', error);
        setError('Не удалось загрузить объявление. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchItem();
  }, [id]);
  
  const confirmStatusChange = (newStatus) => {
    setStatusToChange(newStatus);
    setShowConfirmModal(true);
  };
  
  const handleConfirmStatusChange = async () => {
    const newStatus = statusToChange;
    setShowConfirmModal(false);
    setStatusChangeLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:8000/api/items/items/${id}/change_status/`, 
        { status: newStatus },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setItem(prev => ({ ...prev, status: newStatus }));
    } catch (error) {
      console.error('Ошибка при изменении статуса:', error);
      alert('Не удалось изменить статус объявления. Пожалуйста, попробуйте позже.');
    } finally {
      setStatusChangeLoading(false);
    }
  };
  
  const handleCancelStatusChange = () => {
    setShowConfirmModal(false);
    setStatusToChange(null);
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
  
  if (loading) {
    return (
      <div className="container text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </div>
        <p className="mt-2">Загрузка объявления...</p>
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
  
  if (!item) {
    return (
      <div className="container my-5">
        <div className="alert alert-warning">Объявление не найдено</div>
        <Link to="/items" className="btn btn-primary">Вернуться к списку объявлений</Link>
      </div>
    );
  }
  
  return (
    <div className="container my-4">
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <div className="confirm-modal-header">
              <h5>Подтверждение</h5>
              <button type="button" className="btn-close" onClick={handleCancelStatusChange}></button>
            </div>
            <div className="confirm-modal-body">
              <p>
                {statusToChange === 'resolved' 
                  ? item.type === 'lost' 
                    ? 'Вы уверены, что хотите отметить вещь как найденную?' 
                    : 'Вы уверены, что хотите отметить, что хозяин вещи найден?'
                  : 'Вы уверены, что хотите закрыть объявление?'
                }
              </p>
              <p className="text-muted small">
                {statusToChange === 'resolved' 
                  ? 'Объявление будет помечено как решенное и останется в системе для справки.'
                  : 'Объявление будет закрыто и останется в системе для справки.'
                }
              </p>
            </div>
            <div className="confirm-modal-footer">
              <button type="button" className="btn btn-secondary" onClick={handleCancelStatusChange}>Отмена</button>
              <button 
                type="button" 
                className={`btn ${statusToChange === 'resolved' ? 'btn-success' : 'btn-danger'}`}
                onClick={handleConfirmStatusChange}
                disabled={statusChangeLoading}
              >
                {statusChangeLoading ? 'Обработка...' : 'Подтвердить'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>{item.title}</h2>
          {isOwner && (
            <div className="alert alert-info py-1 px-2 mt-2 mb-0 d-inline-block">
              <i className="bi bi-person-check"></i> Это ваше объявление
            </div>
          )}
        </div>
        <div>
          {isOwner && item.status === 'active' && (
            <>
              <Link to={`/edit-item/${id}`} className="btn btn-outline-primary me-2">
                <i className="bi bi-pencil"></i> Редактировать
              </Link>
              <button 
                className="btn btn-outline-success me-2"
                onClick={() => confirmStatusChange('resolved')}
                disabled={statusChangeLoading}
              >
                <i className="bi bi-check-circle"></i> 
                {item.type === 'lost' ? 'Вещь нашлась' : 'Хозяин нашёлся'}
              </button>
              <button 
                className="btn btn-outline-danger me-2"
                onClick={() => confirmStatusChange('closed')}
                disabled={statusChangeLoading}
              >
                <i className="bi bi-x-circle"></i> Закрыть объявление
              </button>
            </>
          )}
          <Link to="/items" className="btn btn-outline-secondary">Назад к списку</Link>
        </div>
      </div>
      
      <div 
        className={`card mb-4 ${
          item.status === 'resolved' ? 'position-relative item-resolved' : 
          item.status === 'closed' ? 'position-relative item-closed' : 
          'position-relative item-active'
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
        <div className={`card-header ${item.type === 'lost' ? 'bg-primary text-white' : 'bg-success text-white'}`}>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">{getTypeName(item.type)}</h5>
            <span className={`badge ${
              item.status === 'active' ? 'bg-secondary' : 
              item.status === 'resolved' ? 'bg-success' : 
              'bg-danger'
            } text-white`}>
              {getStatusName(item.status)}
            </span>
          </div>
        </div>
        
        <div className="card-body">
          <div className="row">
            <div className="col-md-6 mb-4">
              {item.images && item.images.length > 0 && item.images.some(image => image.file) ? (
                <div className="row">
                  {item.images.filter(image => image.file).map(image => (
                    <div key={image.id} className="col-md-6 mb-3">
                      <img
                        src={image.file_url || `http://localhost:8000${image.file}`}
                        alt={item.title}
                        className="img-fluid rounded"
                        style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="alert alert-light">Нет изображений</div>
              )}
            </div>
            
            <div className="col-md-6">
              <h4>Описание</h4>
              <p>{item.description}</p>
              
              <div className="row mb-3">
                <div className="col-md-6">
                  <strong>Цвет:</strong>
                  <span className="badge bg-secondary ms-2">{getColorName(item.color)}</span>
                </div>
                
                <div className="col-md-6">
                  <strong>Дата {item.type === 'lost' ? 'потери' : 'находки'}:</strong>
                  <span className="ms-2">{formatDate(item.date_event)}</span>
                </div>
              </div>
              
              <div className="mb-3">
                <strong>Место {item.type === 'lost' ? 'потери' : 'находки'}:</strong>
                <p className="mb-0">{item.location_event}</p>
              </div>
              
              {item.type === 'found' && item.storage_location && (
                <div className="mb-3">
                  <strong>Место хранения:</strong>
                  <p className="mb-0">{item.storage_location}</p>
                </div>
              )}
              
              {item.type === 'lost' && item.reward && (
                <div className="mb-3">
                  <strong>Вознаграждение:</strong>
                  <p className="text-success fw-bold mb-0">{item.reward} руб.</p>
                </div>
              )}
              
              <div className="mb-3">
                <strong>Теги:</strong>
                <div>
                  {item.tags && item.tags.length > 0 ? (
                    item.tags.map(tag => (
                      <span key={tag.id} className="badge bg-light text-dark me-1 mb-1">
                        {tag.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-muted">Нет тегов</span>
                  )}
                </div>
              </div>
              
              <div className="mb-3">
                <strong>Опубликовано:</strong>
                <span className="ms-2">{formatDate(item.created_at)}</span>
                <span className="ms-2 text-muted"> пользователем </span>
                <Link to={`/profile/${item.user}`} className="text-decoration-underline">
                  {item.user}
                </Link>
              </div>
              
              {isOwner && item.hidden_details && (
                <div className="mb-3 p-3 bg-light rounded">
                  <strong>Скрытые детали (видны только вам):</strong>
                  <p className="mb-0">{item.hidden_details}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
      </div>
      
      {!isOwner && (
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">Контактная информация</h5>
          </div>
          <div className="card-body">
            <p>
              Если вы {item.type === 'lost' ? 'нашли эту вещь' : 'являетесь владельцем этой вещи'}, 
              пожалуйста, свяжитесь с {item.type === 'lost' ? 'владельцем' : 'нашедшим'} через личный телефон.
            </p>
            <div className="alert alert-info">
              <strong>Важно!</strong> Для подтверждения владения вещью, будьте готовы предоставить 
              детальное описание или доказательства владения.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemDetail;
