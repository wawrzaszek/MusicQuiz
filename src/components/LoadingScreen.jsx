import React from 'react';
import { FaSpinner } from 'react-icons/fa';
import { t } from '../constants/translations';

// Komponent ekranu ładowania (pobierania utworów)
const LoadingScreen = ({ language }) => {
  return (
    <div className="loading-container glass-panel animate-fade-in" style={{textAlign: 'center', padding: '4rem'}}>
      <FaSpinner className="spin-icon" size={48} style={{color: 'var(--accent)', animation: 'spin 1s linear infinite', marginBottom: '1rem'}} />
      <h2>{t[language].loading}</h2>
      {/* Definicja animacji obrotu dla spinnera */}
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default LoadingScreen;
