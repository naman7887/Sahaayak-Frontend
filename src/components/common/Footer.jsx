import { Link } from "react-router-dom";
import { ShieldCheck, HeartHandshake, PhoneCall, Award, MapPin } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-950 text-gray-300 pt-16 pb-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Col 1 & 2: Platform Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-lg">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                {t("app_name")}
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
              Sahaayak is India&apos;s Cooperative Gig Services Platform connecting verified household service artisans with homes and institutions while guaranteeing minimum baseline incomes, social security, and welfare scheme integration.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                <Award className="w-3.5 h-3.5" />
                SIH Problem Statement SIH26089
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-950/80 text-blue-300 border border-blue-800">
                <HeartHandshake className="w-3.5 h-3.5" />
                Cooperative Gig Model
              </span>
            </div>
          </div>

          {/* Col 3: Services */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Cooperative Trades
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/services" className="hover:text-emerald-400 transition">Electricians & Wiring</Link></li>
              <li><Link to="/services" className="hover:text-emerald-400 transition">Plumbing & Sanitation</Link></li>
              <li><Link to="/services" className="hover:text-emerald-400 transition">Carpentry & Joinery</Link></li>
              <li><Link to="/services" className="hover:text-emerald-400 transition">Domestic Assistance</Link></li>
              <li><Link to="/services" className="hover:text-emerald-400 transition">Elderly & Patient Care</Link></li>
              <li><Link to="/services" className="hover:text-emerald-400 transition">Appliance Repair</Link></li>
            </ul>
          </div>

          {/* Col 4: Platform */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Platform & Schemes
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/schemes" className="hover:text-emerald-400 transition">PM-SYM Welfare</Link></li>
              <li><Link to="/schemes" className="hover:text-emerald-400 transition">E-Shram Integration</Link></li>
              <li><Link to="/insurance" className="hover:text-emerald-400 transition">Accidental Insurance</Link></li>
              <li><Link to="/register" className="hover:text-emerald-400 transition">Worker Registration</Link></li>
              <li><Link to="/services" className="hover:text-emerald-400 transition">Instant Booking</Link></li>
            </ul>
          </div>

          {/* Col 5: Cooperative Governance */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Cooperative Desk
            </h4>
            <div className="space-y-3 text-sm text-gray-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
                <span>Federation Secretariat, Cooperative Bhawan, New Delhi</span>
              </div>
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>1800-SAHAAYAK (Toll-free 24x7)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-gray-900 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} Sahaayak Cooperative Gig Services Platform. Developed for SIH 2026.</p>
          <div className="flex gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Cooperative Membership</span>
            <span>Fair Wage Charter</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
