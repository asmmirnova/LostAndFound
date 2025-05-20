import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const EditItemForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    color: '',
    date_event: '',
    location_event: '',
    reward: '',
    storage_location: '',
    hidden_details: '',
    tags: [],
    images: []
  });
  
  const [itemType, setItemType] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  
  // Получение данных объявления
  useEffect(() => {
    const fetchItem = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:8000/api/items/items/${id}/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const item = response.data;
        setItemType(item.type);
        
        // Преобразование тегов из объектов в строки
        const tagNames = item.tags.map(tag => tag.name);
        
        // Установка данных формы
        setFormData({
          title: item.title || '',
          description: item.description || '',
          color: item.color || '',
          date_event: item.date_event || '',
          location_event: item.location_event || '',
          reward: item.reward || '',
          storage_location: item.storage_location || '',
          hidden_details: item.hidden_details || '',
          tags: tagNames
        });
        
        // Установка загруженных изображений
        setUploadedImages(item.images || []);
        
      } catch (error) {
        console.error('Ошибка при получении объявления:', error);
        if (error.response && error.response.status === 404) {
          navigate('/items');
        }
      } finally {
        setInitialLoading(false);
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
    
    fetchItem();
    fetchTags();
  }, [id, navigate]);
  
  // Обработчик изменения полей формы
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Обработчик добавления тега
  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };
  
  // Обработчик удаления тега
  const handleRemoveTag = (tag) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag)
    });
  };
  
  // Обработчик выбора тега из списка
  const handleSelectTag = (tag) => {
    if (!formData.tags.includes(tag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tag]
      });
    }
  };
  
  // Обработчик загрузки изображения
  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (files.length === 0) return;
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('file', files[i]);
        
        const response = await axios.post('http://localhost:8000/api/images/upload/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        });
        
        setUploadedImages(prev => [...prev, response.data]);
      }
    } catch (error) {
      console.error('Ошибка при загрузке изображения:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Обработчик удаления изображения
  const handleRemoveImage = (imageId) => {
    setUploadedImages(uploadedImages.filter(img => img.id !== imageId));
  };
  
  // Обработчик отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Валидация формы
    const newErrors = {};
    if (!formData.title) newErrors.title = 'Название обязательно';
    if (!formData.description) newErrors.description = 'Описание обязательно';
    if (!formData.color) newErrors.color = 'Цвет обязателен';
    if (!formData.date_event) newErrors.date_event = 'Дата обязательна';
    if (!formData.location_event) newErrors.location_event = 'Место обязательно';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      // Подготовка данных для отправки
      const itemData = {
        ...formData,
        type: itemType,
        images: uploadedImages.map(img => img.id)
      };
      
      // Отправка данных на сервер
      await axios.put(`http://localhost:8000/api/items/items/${id}/`, itemData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Перенаправление на страницу с деталями объявления
      navigate(`/items/${id}`);
      
    } catch (error) {
      console.error('Ошибка при обновлении объявления:', error);
      if (error.response && error.response.data) {
        setErrors(error.response.data);
      }
    } finally {
      setLoading(false);
    }
  };
  
  if (initialLoading) {
    return (
      <div className="container text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </div>
        <p className="mt-2">Загрузка данных объявления...</p>
      </div>
    );
  }
  
  return (
    <div className="container">
      <h2>Редактирование объявления</h2>
      
      <form onSubmit={handleSubmit} className="form-container">
        {/* Основная информация */}
        <div className="form-group">
          <label htmlFor="title">Название*</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`form-control ${errors.title ? 'is-invalid' : ''}`}
            placeholder="Например: Красный кошелек"
          />
          {errors.title && <div className="invalid-feedback">{errors.title}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Описание*</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={`form-control ${errors.description ? 'is-invalid' : ''}`}
            rows="4"
            placeholder="Подробно опишите вещь"
          ></textarea>
          {errors.description && <div className="invalid-feedback">{errors.description}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="color">Цвет*</label>
          <select
            id="color"
            name="color"
            value={formData.color}
            onChange={handleChange}
            className={`form-control ${errors.color ? 'is-invalid' : ''}`}
          >
            <option value="">Выберите цвет</option>
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
          {errors.color && <div className="invalid-feedback">{errors.color}</div>}
        </div>
        
        {/* Даты и местоположение */}
        <div className="form-group">
          <label htmlFor="date_event">Дата {itemType === 'lost' ? 'потери' : 'находки'}*</label>
          <input
            type="date"
            id="date_event"
            name="date_event"
            value={formData.date_event}
            onChange={handleChange}
            className={`form-control ${errors.date_event ? 'is-invalid' : ''}`}
          />
          {errors.date_event && <div className="invalid-feedback">{errors.date_event}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="location_event">Место {itemType === 'lost' ? 'потери' : 'находки'}*</label>
          <input
            type="text"
            id="location_event"
            name="location_event"
            value={formData.location_event}
            onChange={handleChange}
            className={`form-control ${errors.location_event ? 'is-invalid' : ''}`}
            placeholder="Например: Парк Горького, возле главного входа"
          />
          {errors.location_event && <div className="invalid-feedback">{errors.location_event}</div>}
        </div>
        
        {/* Дополнительная информация в зависимости от типа объявления */}
        {itemType === 'lost' && (
          <div className="form-group">
            <label htmlFor="reward">Вознаграждение (руб.)</label>
            <input
              type="number"
              id="reward"
              name="reward"
              value={formData.reward}
              onChange={handleChange}
              className="form-control"
              placeholder="Укажите сумму вознаграждения"
              min="0"
              step="100"
            />
          </div>
        )}
        
        {itemType === 'found' && (
          <div className="form-group">
            <label htmlFor="storage_location">Место хранения</label>
            <input
              type="text"
              id="storage_location"
              name="storage_location"
              value={formData.storage_location}
              onChange={handleChange}
              className="form-control"
              placeholder="Укажите, где сейчас находится найденная вещь"
            />
          </div>
        )}
        
        <div className="form-group">
          <label htmlFor="hidden_details">Скрытые детали для верификации</label>
          <textarea
            id="hidden_details"
            name="hidden_details"
            value={formData.hidden_details}
            onChange={handleChange}
            className="form-control"
            rows="3"
            placeholder="Укажите детали, которые знаете только вы (например, содержимое кошелька, особые метки и т.д.)"
          ></textarea>
          <small className="form-text text-muted">Эта информация будет видна только вам и поможет идентифицировать вашу вещь</small>
        </div>
        
        {/* Теги */}
        <div className="form-group">
          <label>Теги</label>
          <div className="input-group mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              className="form-control"
              placeholder="Добавьте тег (например: деньги, документы, ключи)"
            />
            <div className="input-group-append">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleAddTag}
              >
                Добавить
              </button>
            </div>
          </div>
          
          {/* Список популярных тегов */}
          <div className="mb-2">
            <small className="text-muted">Популярные теги:</small>
            <div className="d-flex flex-wrap">
              {availableTags.slice(0, 10).map(tag => (
                <span
                  key={tag.id}
                  className="badge bg-light text-dark m-1 clickable"
                  onClick={() => handleSelectTag(tag.name)}
                  style={{ cursor: 'pointer' }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
          
          {/* Выбранные теги */}
          <div className="selected-tags">
            {formData.tags.map(tag => (
              <span key={tag} className="badge bg-primary m-1">
                {tag}
                <button
                  type="button"
                  className="btn-close btn-close-white ms-1"
                  style={{ fontSize: '0.5rem' }}
                  onClick={() => handleRemoveTag(tag)}
                ></button>
              </span>
            ))}
          </div>
        </div>
        
        {/* Загрузка изображений */}
        <div className="form-group">
          <label htmlFor="images">Фотографии</label>
          <input
            type="file"
            id="images"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="form-control"
          />
          <small className="form-text text-muted">Загрузите дополнительные фотографии</small>
        </div>
        
        {/* Предпросмотр загруженных изображений */}
        {uploadedImages.length > 0 && (
          <div className="uploaded-images mt-3">
            <h5>Загруженные изображения:</h5>
            <div className="row">
              {uploadedImages.map(image => (
                <div key={image.id} className="col-md-3 mb-3">
                  <div className="card">
                    <img
                      src={image.file_url || `http://localhost:8000${image.file}`}
                      alt="Uploaded"
                      className="card-img-top"
                      style={{ height: '150px', objectFit: 'cover' }}
                    />
                    <div className="card-body p-2">
                      <button
                        type="button"
                        className="btn btn-sm btn-danger w-100"
                        onClick={() => handleRemoveImage(image.id)}
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Кнопки */}
        <div className="form-group mt-4 d-flex justify-content-between">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => navigate(`/items/${id}`)}
          >
            Отмена
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Сохранение...' : 'Сохранить изменения'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditItemForm;
