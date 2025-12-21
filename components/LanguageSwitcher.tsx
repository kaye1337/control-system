'use client';

import { useLanguage } from './LanguageContext';
import { Language } from '@/lib/translations';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="absolute top-4 right-4 z-50">
      <select 
        value={language} 
        onChange={(e) => setLanguage(e.target.value as Language)}
        className="bg-white border border-gray-300 text-gray-700 py-1 px-3 rounded shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="zh">中文</option>
        <option value="en">English</option>
        <option value="ja">日本語</option>
        <option value="th">ไทย</option>
      </select>
    </div>
  );
}
