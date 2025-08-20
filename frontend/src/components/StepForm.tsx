import React, { useState } from 'react';
import { CookingStep, StepMedia } from '../types';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

interface StepFormProps {
  step: CookingStep;
  onUpdate: (step: CookingStep) => void;
  onDelete: () => void;
  stepIndex: number;
}

const StepForm: React.FC<StepFormProps> = ({ step, onUpdate, onDelete, stepIndex }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const updatedStep: CookingStep = {
      ...step,
      description: e.target.value
    };
    onUpdate(updatedStep);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });

      const response = await axios.post(`${API_ENDPOINTS.MEDIA_UPLOAD}/upload-step-files`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        const newMedia: StepMedia[] = response.data.files.map((fileInfo: any) => ({
          id: `media-${Date.now()}-${Math.random()}`,
          type: fileInfo.type as 'image' | 'video',
          filename: fileInfo.filename,
          url: `http://127.0.0.1:8001${fileInfo.url}`,
          alt: `Крок ${step.stepNumber} - ${fileInfo.original_filename}`
        }));

        const updatedStep: CookingStep = {
          ...step,
          media: [...(step.media || []), ...newMedia]
        };
        onUpdate(updatedStep);
      }
    } catch (error: any) {
      console.error('Помилка завантаження файлів:', error);
      setUploadError(error.response?.data?.detail || 'Не вдалося завантажити файли');
    } finally {
      setIsUploading(false);
      // Очищуємо input
      e.target.value = '';
    }
  };

  const handleDeleteMedia = async (mediaIndex: number) => {
    if (!step.media) return;
    
    const mediaToDelete = step.media[mediaIndex];
    
    try {
      // Видаляємо файл з сервера
      await axios.delete(`${API_ENDPOINTS.MEDIA_UPLOAD}/delete-step-file/${mediaToDelete.filename}`);
      
      // Видаляємо з локального стану
      const updatedMedia = step.media.filter((_, index) => index !== mediaIndex);
      const updatedStep: CookingStep = {
        ...step,
        media: updatedMedia
      };
      onUpdate(updatedStep);
    } catch (error) {
      console.error('Помилка видалення файлу:', error);
      // Все одно видаляємо з UI, навіть якщо не вдалося видалити з сервера
      const updatedMedia = step.media.filter((_, index) => index !== mediaIndex);
      const updatedStep: CookingStep = {
        ...step,
        media: updatedMedia
      };
      onUpdate(updatedStep);
    }
  };

  return (
    <div className="card mb-3">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="card-title mb-0">
            <span className="badge bg-primary me-2">{step.stepNumber}</span>
            Крок {step.stepNumber}
          </h6>
          <button
            type="button"
            className="btn btn-outline-danger btn-sm"
            onClick={onDelete}
            title="Видалити крок"
          >
            <i className="bi bi-trash"></i>
          </button>
        </div>

        {/* Опис кроку */}
        <div className="mb-3">
          <label className="form-label">Опис кроку *</label>
          <textarea
            className="form-control"
            rows={3}
            value={step.description}
            onChange={handleDescriptionChange}
            placeholder="Опишіть що потрібно зробити на цьому кроці..."
            required
          />
        </div>

        {/* Завантаження медіа */}
        <div className="mb-3">
          <label className="form-label">
            Фото або відео (необов'язково)
            <small className="text-muted ms-2">Максимум 10MB на файл, до 5 файлів</small>
          </label>
          <input
            type="file"
            className="form-control"
            multiple
            accept="image/*,video/*"
            onChange={handleFileUpload}
            disabled={isUploading}
          />
          {uploadError && (
            <div className="text-danger mt-1">
              <small>{uploadError}</small>
            </div>
          )}
        </div>

        {/* Відображення завантажених медіа */}
        {step.media && step.media.length > 0 && (
          <div className="uploaded-media">
            <label className="form-label">Завантажені файли:</label>
            <div className="row">
              {step.media.map((media, mediaIndex) => (
                <div key={media.id || mediaIndex} className="col-md-6 col-lg-4 mb-2">
                  <div className="position-relative">
                    {media.type === 'image' ? (
                      <img
                        src={media.url}
                        alt={media.alt}
                        className="img-fluid rounded"
                        style={{ height: '80px', width: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <video
                        src={media.url}
                        className="w-100 rounded"
                        style={{ height: '80px', objectFit: 'cover' }}
                      />
                    )}
                    <button
                      type="button"
                      className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1"
                      style={{ fontSize: '10px', padding: '2px 6px' }}
                      onClick={() => handleDeleteMedia(mediaIndex)}
                      title="Видалити файл"
                    >
                      ×
                    </button>
                    <div className="position-absolute bottom-0 start-0 m-1">
                      <span className={`badge ${media.type === 'image' ? 'bg-success' : 'bg-primary'}`} 
                            style={{ fontSize: '8px' }}>
                        {media.type === 'image' ? 'Фото' : 'Відео'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isUploading && (
          <div className="text-center">
            <div className="spinner-border spinner-border-sm me-2" role="status"></div>
            <small>Завантажуємо файли...</small>
          </div>
        )}
      </div>
    </div>
  );
};

export default StepForm;