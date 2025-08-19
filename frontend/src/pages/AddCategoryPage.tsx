import React from 'react';
import { Link } from 'react-router-dom';
import CategoryForm from '../components/CategoryForm';

const AddCategoryPage: React.FC = () => {
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Додати нову категорію</h2>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to="/categories">Категорії</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Додати категорію
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="row">
        <div className="col-md-8">
          <div className="card">
            <div className="card-body">
              <CategoryForm />
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Поради для категорій</h5>
            </div>
            <div className="card-body">
              <ul className="list-unstyled">
                <li className="mb-2">
                  <strong>Унікальність:</strong> Назва категорії має бути унікальною
                </li>
                <li className="mb-2">
                  <strong>Зрозумілість:</strong> Використовуйте описові назви (наприклад: "Супи", "Десерти")
                </li>
                <li className="mb-2">
                  <strong>Логічність:</strong> Групуйте схожі типи страв разом
                </li>
              </ul>
              
              <div className="mt-3">
                <h6>Приклади категорій:</h6>
                <div className="d-flex flex-wrap gap-1">
                  <span className="badge bg-light text-dark">Супи</span>
                  <span className="badge bg-light text-dark">Салати</span>
                  <span className="badge bg-light text-dark">М'ясні страви</span>
                  <span className="badge bg-light text-dark">Десерти</span>
                  <span className="badge bg-light text-dark">Напої</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCategoryPage;