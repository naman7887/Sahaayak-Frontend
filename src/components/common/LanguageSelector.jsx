import { useLanguage } from "../../context/LanguageContext";
import { Globe } from "lucide-react";

export const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200/80 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-gray-700 transition">
      <Globe className="w-3.5 h-3.5 text-emerald-700" />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="bg-transparent border-none outline-hidden cursor-pointer text-gray-800 font-semibold"
      >
        <option value="en">English (EN)</option>
        <option value="hi">हिंदी (HI)</option>
      </select>
    </div>
  );
};

export default LanguageSelector;
