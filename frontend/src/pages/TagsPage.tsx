import React from 'react';
import { Link } from 'react-router-dom';
import TagList from '../components/TagList';

const TagsPage: React.FC = () => {
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Управління тегами</h2>
        <Link to="/add-tag" className="btn btn-primary">
          Додати новий тег
        </Link>
      </div>
      
      <p className="text-muted mb-4">
        Теги допомагають організувати рецепти за типами кухні, способами приготування та іншими характеристиками.
      </p>

      <TagList />
    </div>
  );
};

export default TagsPage;