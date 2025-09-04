import React, { useState } from 'react';
import { StepMedia as StepMediaType } from '../types';

interface StepMediaProps {
  media: StepMediaType[];
  stepNumber: number;
}

const StepMedia: React.FC<StepMediaProps> = ({ media, stepNumber }) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (!media || media.length === 0) {
    return null;
  }

  const currentMedia = media[currentMediaIndex];

  const handlePrevious = () => {
    setCurrentMediaIndex((prev) => 
      prev === 0 ? media.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentMediaIndex((prev) => 
      prev === media.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="step-media-container mt-3">
      <div className="media-viewer position-relative">
        {currentMedia.type === 'image' ? (
          <>
            {!imageError ? (
              <img
                src={currentMedia.url}
                alt={currentMedia.alt || `Крок ${stepNumber}`}
                className="img-fluid rounded shadow-sm w-100 recipe-step-image"
                style={{ 
                  aspectRatio: '16/9',
                  objectFit: 'contain',
                  maxHeight: '400px',
                  minHeight: '200px',
                  backgroundColor: '#f8f9fa'
                }}
                loading="lazy"
                onError={() => setImageError(true)}
                onClick={() => setShowFullscreen(true)}
              />
            ) : (
              <div 
                className="d-flex align-items-center justify-content-center bg-light rounded"
                style={{ 
                  aspectRatio: '16/9',
                  maxHeight: '400px',
                  minHeight: '200px'
                }}
              >
                <div className="text-center text-muted">
                  <i className="bi bi-image-fill fs-1 mb-2 d-block"></i>
                  <small>Не вдалося завантажити зображення</small>
                </div>
              </div>
            )}
          </>
        ) : (
          <video
            src={currentMedia.url}
            controls
            className="w-100 rounded shadow-sm recipe-step-video"
            style={{ 
              aspectRatio: '16/9',
              maxHeight: '400px',
              minHeight: '200px'
            }}
          >
            Ваш браузер не підтримує відео.
          </video>
        )}

        {/* Navigation between media files */}
        {media.length > 1 && (
          <>
            <button
              className="btn btn-dark btn-sm position-absolute top-50 start-0 translate-middle-y ms-2 opacity-75"
              onClick={handlePrevious}
              style={{ zIndex: 10 }}
            >
              <i className="bi bi-chevron-left"></i>
            </button>
            <button
              className="btn btn-dark btn-sm position-absolute top-50 end-0 translate-middle-y me-2 opacity-75"
              onClick={handleNext}
              style={{ zIndex: 10 }}
            >
              <i className="bi bi-chevron-right"></i>
            </button>

            {/* Indicators */}
            <div className="position-absolute bottom-0 start-50 translate-middle-x mb-2">
              <div className="d-flex gap-1">
                {media.map((_, index) => (
                  <button
                    key={index}
                    className={`btn btn-sm rounded-circle ${
                      index === currentMediaIndex ? 'btn-light' : 'btn-secondary'
                    }`}
                    style={{ width: '8px', height: '8px', padding: 0 }}
                    onClick={() => setCurrentMediaIndex(index)}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {/* File type badge */}
        <span className="position-absolute top-0 end-0 m-2">
          <span className={`badge ${currentMedia.type === 'image' ? 'bg-success' : 'bg-primary'}`}>
            {currentMedia.type === 'image' ? (
              <><i className="bi bi-image me-1"></i>Фото</>
            ) : (
              <><i className="bi bi-play-circle me-1"></i>Відео</>
            )}
          </span>
        </span>
      </div>

      {/* Media information */}
      {media.length > 1 && (
        <div className="text-center mt-2">
          <small className="text-muted">
            {currentMediaIndex + 1} з {media.length} медіа файлів
          </small>
        </div>
      )}

      {/* Fullscreen Modal */}
      {showFullscreen && currentMedia.type === 'image' && (
        <div 
          className="modal show d-block" 
          style={{ backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 1060 }}
          onClick={() => setShowFullscreen(false)}
        >
          <div className="modal-dialog modal-xl modal-fullscreen-lg-down d-flex align-items-center">
            <div className="position-relative w-100">
              <img
                src={currentMedia.url}
                alt={currentMedia.alt || `Крок ${stepNumber}`}
                className="img-fluid w-100 h-auto"
                style={{ maxHeight: '90vh', objectFit: 'contain' }}
                onClick={(e) => e.stopPropagation()}
              />
              <button
                className="btn btn-light position-absolute top-0 end-0 m-3 rounded-circle"
                onClick={() => setShowFullscreen(false)}
                style={{ width: '40px', height: '40px' }}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StepMedia;