import React from 'react';
import { t } from '../constants/translations';

// Komponent dolnego paska (stopka)
const Footer = ({ language }) => {
  return (
    <footer style={{marginTop: 'auto', paddingTop: '2rem', textAlign: 'center', opacity: 0.5, fontSize: '0.85rem'}}>
      {t[language].footerText}
    </footer>
  );
};

export default Footer;
