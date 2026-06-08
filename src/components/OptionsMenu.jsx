import React from 'react';
import { FaArrowRight } from 'react-icons/fa';
import { t } from '../constants/translations';

// Komponent menu opcji (język, głośność)
const OptionsMenu = ({ 
  language, 
  setLanguage, 
  volume, 
  setVolume, 
  onBack 
}) => {
  return (
    <div className="options-container glass-panel animate-fade-in" style={{textAlign: 'center', padding: '2rem'}}>
      <h1>{t[language].optionsTitle}</h1>
      
      <div className="option-group" style={{margin: '2rem 0', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center'}}>
        {/* Opcja zmiany języka */}
        <div style={{display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '300px', alignItems: 'center'}}>
          <label style={{fontSize: '1.2rem', fontWeight: 'bold'}}>{t[language].language}:</label>
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            style={{padding: '0.5rem 1rem', borderRadius: '10px', background: 'var(--bg-card)', color: 'var(--text)', border: '1px solid var(--accent)', fontSize: '1.1rem'}}
          >
            <option value="pl">Polski</option>
            <option value="en">English</option>
          </select>
        </div>

        {/* Opcja regulacji głośności */}
        <div style={{display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '300px', alignItems: 'center'}}>
          <label style={{fontSize: '1.2rem', fontWeight: 'bold'}}>{t[language].volume}:</label>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.05" 
            value={volume} 
            onChange={(e) => setVolume(parseFloat(e.target.value))} 
            style={{width: '150px'}}
          />
        </div>

        {/* Informacja o źródle muzyki */}
        <div style={{marginTop: '1.5rem', padding: '1rem', background: 'var(--bg-card-hover)', borderRadius: '12px', fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '400px', textAlign: 'center'}}>
          {t[language].musicSource}
        </div>
      </div>

      <button className="btn btn-primary" onClick={onBack}>
        <FaArrowRight style={{transform: 'rotate(180deg)', marginRight: '8px'}} /> {t[language].back}
      </button>
    </div>
  );
};

export default OptionsMenu;
