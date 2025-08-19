import React from 'react';
import { Link, useParams } from 'react-router-dom';
import CategoryForm from '../components/CategoryForm';

const EditCategoryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Редагувати категорію</h2>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to="/categories">Категорії</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Редагувати категорію #{id}
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="row">
        <div className="col-md-8">
          <div className="card">
            <div className="card-body">
              <CategoryForm isEditMode={true} />
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-warning">
            <div className="card-header bg-warning">
              <h5 className="card-title mb-0">
                <i className="bi bi-exclamation-triangle me-2"></i>
                Увага
              </h5>
            </div>
            <div className="card-body">
              <p className="card-text">
                Зміна назви категорії вплине на всі рецепти, які використовують цю категорію.
              </p>
              <p className="card-text">
                Переконайтесь, що нова назва відповідає змісту всіх пов'язаних рецептів.
              </p>
              <hr />
              <p className="card-text">
                <small className="text-muted">
                  Рецепти автоматично оновляться з новою назвою категорії.
                </small>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCategoryPage;