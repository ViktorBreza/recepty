import React, { useState } from 'react';
import { CookingStep, StepMedia } from '../types';
import axios from 'axios';
import { API_ENDPOINTS, API_BASE_URL } from '../config/api';
import { processImageFiles, validateImageFile } from '../utils/imageUtils';

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
      const fileArray = Array.from(files);
      
      // Validate files first
      const validationErrors: string[] = [];
      fileArray.forEach((file, index) => {
        const validation = validateImageFile(file);
        if (!validation.isValid && validation.error) {
          validationErrors.push(`${file.name}: ${validation.error}`);
        }
      });

      if (validationErrors.length > 0) {
        setUploadError(validationErrors.join('; '));
        return;
      }

      // Separate images and videos
      const imageFiles = fileArray.filter(file => file.type.startsWith('image/'));
      const videoFiles = fileArray.filter(file => file.type.startsWith('video/'));

      // Process images (resize/optimize)
      const processedImages = imageFiles.length > 0 
        ? await processImageFiles(imageFiles, { maxWidth: 1200, maxHeight: 800, quality: 0.85 })
        : [];

      // Combine processed images with videos
      const allProcessedFiles = [...processedImages, ...videoFiles];

      const formData = new FormData();
      allProcessedFiles.forEach(file => {
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
          url: `${API_BASE_URL}${fileInfo.url}`,
          alt: `Step ${step.stepNumber} - ${fileInfo.original_filename}`
        }));

        const updatedStep: CookingStep = {
          ...step,
          media: [...(step.media || []), ...newMedia]
        };
        onUpdate(updatedStep);
      }
    } catch (error: any) {
      console.error('File upload error:', error);
      setUploadError(error.response?.data?.detail || 'Не вдалося завантажити файли');
    } finally {
      setIsUploading(false);
      // Clear input
      e.target.value = '';
    }
  };

  const handleDeleteMedia = async (mediaIndex: number) => {
    if (!step.media) return;
    
    const mediaToDelete = step.media[mediaIndex];
    
    try {
      // Delete file from server
      await axios.delete(`${API_ENDPOINTS.MEDIA_UPLOAD}/delete-step-file/${mediaToDelete.filename}`);
      
      // Remove from local state
      const updatedMedia = step.media.filter((_, index) => index !== mediaIndex);
      const updatedStep: CookingStep = {
        ...step,
        media: updatedMedia
      };
      onUpdate(updatedStep);
    } catch (error) {
      console.error('File deletion error:', error);
      // Still remove from UI, even if server deletion failed
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

        {/* Step description */}
        <div className="mb-3">
          <label className="form-label">Опис кроку *</label>
          <textarea
            className="form-control"
            rows={3}
            value={step.description}
            onChange={handleDescriptionChange}
            placeholder="Опишіть, що потрібно зробити в цьому кроці..."
            required
          />
        </div>

        {/* Media upload */}
        <div className="mb-3">
          <label className="form-label">
            Фото або відео (опціонально)
            <small className="text-muted ms-2">Максимум 10МБ на файл, до 5 файлів</small>
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

        {/* Display uploaded media */}
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
                        style={{ height: '80px', width: '100%', objectFit: 'contain', backgroundColor: '#f8f9fa' }}
                      />
                    ) : (
                      <video
                        src={media.url}
                        className="w-100 rounded"
                        style={{ height: '80px', objectFit: 'contain', backgroundColor: '#f8f9fa' }}
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
            <small>Завантаження файлів...</small>
          </div>
        )}
      </div>
    </div>
  );
};

export default StepForm;