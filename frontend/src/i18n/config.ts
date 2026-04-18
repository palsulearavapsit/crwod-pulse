import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "dashboard_title": "CrowdPulse Attendee Gateway",
      "live_updates": "Live Venue Updates",
      "zones": "Zones",
      "wait_time": "Wait Time",
      "emergency": "Emergency Guide",
      "chat": "AI Assistant",
      "ingress": "Optimal Ingress Path"
    }
  },
  hi: {
    translation: {
      "dashboard_title": "क्राउडपल्स गेटवे",
      "live_updates": "लाइव अपडेट",
      "zones": "क्षेत्र",
      "wait_time": "प्रतीक्षा समय",
      "emergency": "आपातकालीन मार्गदर्शिका",
      "chat": "एआई सहायक",
      "ingress": "इष्टतम प्रवेश मार्ग"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
