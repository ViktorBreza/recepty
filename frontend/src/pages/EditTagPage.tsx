import React from 'react';
import { Link, useParams } from 'react-router-dom';
import TagForm from '../components/TagForm';

const EditTagPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Редагувати тег</h2>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to="/tags">Теги</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Редагувати тег #{id}
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="row">
        <div className="col-md-8">
          <div className="card">
            <div className="card-body">
              <TagForm isEditMode={true} />
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Увага</h5>
            </div>
            <div className="card-body">
              <p className="card-text">
                Зміна назви тегу вплине на всі рецепти, які використовують цей тег.
              </p>
              <p className="card-text">
                Переконайтесь, що нова назва відповідає змісту всіх пов'язаних рецептів.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTagPage;