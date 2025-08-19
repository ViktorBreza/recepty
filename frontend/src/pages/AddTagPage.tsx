import React from 'react';
import { Link } from 'react-router-dom';
import TagForm from '../components/TagForm';

const AddTagPage: React.FC = () => {
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Додати новий тег</h2>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to="/tags">Теги</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Додати тег
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="row">
        <div className="col-md-8">
          <div className="card">
            <div className="card-body">
              <TagForm />
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Поради</h5>
            </div>
            <div className="card-body">
              <ul className="list-unstyled">
                <li className="mb-2">
                  <strong>Унікальність:</strong> Назва тегу має бути унікальною
                </li>
                <li className="mb-2">
                  <strong>Стислість:</strong> Використовуйте короткі та зрозумілі назви
                </li>
                <li className="mb-2">
                  <strong>Консистентність:</strong> Дотримуйтесь єдиного стилю назв
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddTagPage;