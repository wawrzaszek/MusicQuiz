import React from 'react';
import { FaMusic } from 'react-icons/fa';
import { t } from '../constants/translations';
import { categories } from '../data/songs';

// Komponent głównego menu gry z wyborem kategorii
const MainMenu = ({ language, onStartGame }) => {
  return (
    <div className="menu-container glass-panel animate-fade-in">
      <h1 style={{ fontWeight: 'bold' }}>{t[language].menuTitle}</h1>
      <p>{t[language].menuDesc}</p>
      
      <div className="category-grid">
        {/* Renderowanie przycisków dla każdej kategorii muzycznej */}
        {categories.map(cat => (
          <button 
            key={cat.id} 
            className="category-card"
            style={{'--cat-color': cat.color}}
            onClick={() => onStartGame(cat.id)}
          >
            <FaMusic size={32} />
            <h3>{cat.name[language]}</h3>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MainMenu;
