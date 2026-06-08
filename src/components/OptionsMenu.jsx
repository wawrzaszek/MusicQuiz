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
      <h1 style={{ fontWeight: 'bold' }}>{t[language].optionsTitle}</h1>
      
      <div className="option-group" style={{margin: '3rem auto', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', maxWidth: '400px'}}>
        {/* Opcja zmiany języka */}
        <div style={{display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', background: 'var(--bg-card)', padding: '1.2rem 1.5rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)'}}>
          <label style={{fontSize: '1.1rem', fontWeight: '500', color: 'var(--text-primary)', margin: 0}}>{t[language].language}</label>
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            style={{padding: '0.4rem 0.8rem', borderRadius: '8px', background: 'transparent', color: 'var(--text-primary)', border: '1px solid rgba(255, 255, 255, 0.3)', fontSize: '1rem', cursor: 'pointer', outline: 'none'}}
          >
            <option value="pl" style={{background: '#111'}}>Polski</option>
            <option value="en" style={{background: '#111'}}>English</option>
          </select>
        </div>

        {/* Opcja regulacji głośności */}
        <div style={{display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', background: 'var(--bg-card)', padding: '1.2rem 1.5rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)'}}>
          <label style={{fontSize: '1.1rem', fontWeight: '500', color: 'var(--text-primary)', margin: 0}}>{t[language].volume}</label>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.05" 
            value={volume} 
            onChange={(e) => setVolume(parseFloat(e.target.value))} 
            style={{width: '130px', accentColor: 'var(--text-primary)'}}
          />
        </div>

        {/* Informacja o źródle muzyki */}
        <div style={{marginTop: '1rem', padding: '0.5rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center'}}>
          {t[language].musicSource}
        </div>
      </div>

      <button 
        onClick={onBack} 
        style={{
          background: 'transparent', 
          color: 'var(--text-primary)', 
          border: '1px solid rgba(255, 255, 255, 0.3)', 
          padding: '0.8rem 2rem', 
          borderRadius: '50px', 
          fontSize: '1rem', 
          cursor: 'pointer', 
          display: 'inline-flex', 
          alignItems: 'center', 
          transition: 'all 0.2s'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background='var(--bg-card)'; 
          e.currentTarget.style.borderColor='var(--text-primary)';
        }} 
        onMouseOut={(e) => {
          e.currentTarget.style.background='transparent'; 
          e.currentTarget.style.borderColor='rgba(255, 255, 255, 0.3)';
        }}
      >
        <FaArrowRight style={{transform: 'rotate(180deg)', marginRight: '8px'}} /> {t[language].back}
      </button>
    </div>
  );
};

export default OptionsMenu;
