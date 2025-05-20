import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const FoundItemForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    color: '',
    date_event: '',
    location_event: '',
    storage_location: '',
    hidden_details: '',
    tags: [],
    images: []
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  
  // Получение списка доступных тегов
  useEffect(() => {
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
    
    fetchTags();
  }, []);
  
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
        
        // Используем file_url вместо file для отображения
        const imageData = {
          ...response.data,
          file: response.data.file_url
        };
        
        setUploadedImages(prev => [...prev, imageData]);
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
    if (!formData.storage_location) newErrors.storage_location = 'Место хранения обязательно';
    
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
        type: 'found',
        images: uploadedImages.map(img => img.id)
      };
      
      // Отправка данных на сервер
      await axios.post('http://localhost:8000/api/items/items/', itemData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Перенаправление на страницу со списком объявлений
      navigate('/items');
      
    } catch (error) {
      console.error('Ошибка при создании объявления:', error);
      if (error.response && error.response.data) {
        setErrors(error.response.data);
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container my-4">
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-success text-white">
          <h5 className="mb-0">
            <i className="bi bi-search me-2"></i>
            Я нашел вещь
          </h5>
        </div>
        
        <div className="card-body">
          <form onSubmit={handleSubmit}>
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
                placeholder="Подробно опишите вещь, которую вы нашли"
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
              <label htmlFor="date_event">Дата находки*</label>
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
              <label htmlFor="location_event">Место находки*</label>
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
            
            {/* Дополнительная информация */}
            <div className="form-group">
              <label htmlFor="storage_location">Место хранения*</label>
              <input
                type="text"
                id="storage_location"
                name="storage_location"
                value={formData.storage_location}
                onChange={handleChange}
                className={`form-control ${errors.storage_location ? 'is-invalid' : ''}`}
                placeholder="Укажите, где сейчас находится найденная вещь"
              />
              {errors.storage_location && <div className="invalid-feedback">{errors.storage_location}</div>}
              <small className="form-text text-muted">Например: "У меня дома", "В бюро находок ТЦ Галерея", "В полиции"</small>
            </div>
            
            <div className="form-group">
              <label htmlFor="hidden_details">Скрытые детали для верификации</label>
              <textarea
                id="hidden_details"
                name="hidden_details"
                value={formData.hidden_details}
                onChange={handleChange}
                className="form-control"
                rows="3"
                placeholder="Укажите детали, которые не видны на фото, но могут помочь владельцу опознать вещь"
              ></textarea>
              <small className="form-text text-muted">Эта информация будет видна только вам и поможет идентифицировать владельца вещи</small>
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
              <small className="form-text text-muted">Загрузите фотографии найденной вещи</small>
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
                          src={image.file}
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
            
            {/* Кнопка отправки */}
            <div className="form-group mt-4">
              <button
                type="submit"
                className="btn btn-success btn-block"
                disabled={loading}
              >
                {loading ? 'Отправка...' : 'Опубликовать объявление'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FoundItemForm;
