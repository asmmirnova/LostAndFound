import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ImageList = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Функция для загрузки изображения
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Пожалуйста, выберите файл');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setError('');
    setUploadProgress(0);
    setUploadSuccess(false);

    try {
      const response = await axios.post('http://localhost:8000/api/images/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
      });

      setUploadSuccess(true);
      setFile(null);
      // Добавляем новое изображение в список
      setImages([response.data, ...images]);
      
      // Сбрасываем прогресс через 2 секунды
      setTimeout(() => {
        setUploadProgress(0);
        setUploadSuccess(false);
      }, 2000);
      
    } catch (err) {
      setError(
        err.response && err.response.data
          ? Object.values(err.response.data).join(', ')
          : 'Ошибка при загрузке изображения'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Загрузка изображений</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {uploadSuccess && <div className="alert alert-success">Изображение успешно загружено!</div>}
      
      <form onSubmit={handleUpload} className="form-container">
        <div className="form-group">
          <label htmlFor="file">Выберите изображение</label>
          <input
            type="file"
            id="file"
            accept="image/*"
            onChange={handleFileChange}
            className="form-control"
          />
        </div>
        
        {uploadProgress > 0 && (
          <div className="progress mb-3">
            <div
              className="progress-bar"
              role="progressbar"
              style={{ width: `${uploadProgress}%` }}
              aria-valuenow={uploadProgress}
              aria-valuemin="0"
              aria-valuemax="100"
            >
              {uploadProgress}%
            </div>
          </div>
        )}
        
        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={!file || loading}
        >
          {loading ? 'Загрузка...' : 'Загрузить'}
        </button>
      </form>
      
      <h3 className="mt-4">Загруженные изображения</h3>
      
      <div className="row">
        {images.filter(image => image.file_url || image.file).map((image) => (
          <div key={image.id} className="col-md-4 mb-4">
            <div className="card">
              <img
                src={image.file_url || `http://localhost:8000${image.file}`}
                alt={`Изображение ${image.id}`}
                className="card-img-top"
              />
              <div className="card-body">
                <p className="card-text">
                  Загружено: {new Date(image.uploaded_at).toLocaleString()}
                </p>
                <a
                  href={image.file_url || `http://localhost:8000${image.file}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-primary"
                >
                  Открыть
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageList;
