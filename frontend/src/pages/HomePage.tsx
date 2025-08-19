import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="p-5 mb-4 bg-light rounded-3">
      <div className="container-fluid py-5">
        <h1 className="display-5 fw-bold">Ласкаво просимо до Книги Рецептів!</h1>
        <p className="col-md-8 fs-4">
          Тут ви можете знайти, додати та поділитися найкращими рецептами.
          Почніть з перегляду нашого каталогу.
        </p>
        <Link className="btn btn-primary btn-lg" to="/recipes">
          Переглянути рецепти
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
