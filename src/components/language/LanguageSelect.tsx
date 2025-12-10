import { IonSelect, IonSelectOption } from '@ionic/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Storage } from '@capacitor/storage';
import './LanguageSelect.css'; // Import your custom styles if needed


const LanguageSelect: React.FC = () => {
  const [selectedLang, setSelectedLang] = useState<'vi' | 'en'>('vi');
  const [showDropdown, setShowDropdown] = useState(false);
  const { i18n } = useTranslation();
  const handleSelect = (lang: 'vi' | 'en') => {
    setSelectedLang(lang);
    i18n.changeLanguage(lang);
    setShowDropdown(false);
    Storage.set({ key: 'lang', value: lang });
  };

  return (
    <div className="lang-wrapper">
      <button className="lang-button" onClick={() => setShowDropdown(!showDropdown)}>
        <span className="flag">{selectedLang === 'vi' ? '🇻🇳' : '🇺🇸'}</span>
        <span className="label">{selectedLang === 'vi' ? 'Tiếng Việt' : 'English'}</span>
      </button>

      {showDropdown && (
        <div className="lang-dropdown">
          <div className="lang-option" onClick={() => handleSelect('vi')}>
            🇻🇳 Tiếng Việt
          </div>
          <div className="lang-option" onClick={() => handleSelect('en')}>
            🇺🇸 English
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelect;
