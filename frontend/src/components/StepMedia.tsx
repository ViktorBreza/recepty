import React, { useState } from 'react';
import { StepMedia as StepMediaType } from '../types';

interface StepMediaProps {
  media: StepMediaType[];
  stepNumber: number;
}

const StepMedia: React.FC<StepMediaProps> = ({ media, stepNumber }) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

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
          <img
            src={currentMedia.url}
            alt={currentMedia.alt || `Крок ${stepNumber}`}
            className="img-fluid rounded shadow-sm w-100"
            style={{ maxHeight: '300px', objectFit: 'cover' }}
          />
        ) : (
          <video
            src={currentMedia.url}
            controls
            className="w-100 rounded shadow-sm"
            style={{ maxHeight: '300px' }}
          >
            Ваш браузер не підтримує відео.
          </video>
        )}

        {/* Навігація між медіа файлами */}
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

            {/* Індикатори */}
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

        {/* Бейдж типу файлу */}
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

      {/* Інформація про медіа */}
      {media.length > 1 && (
        <div className="text-center mt-2">
          <small className="text-muted">
            {currentMediaIndex + 1} з {media.length} медіа-файлів
          </small>
        </div>
      )}
    </div>
  );
};

export default StepMedia;