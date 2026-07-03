import { Link } from "react-router-dom";
import { Camera, Globe, Send } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-900/60 py-16 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Logo Column */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 text-white font-bold text-lg tracking-tight">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-[#0B3037] text-white">
                <Camera className="h-4.5 w-4.5" />
              </div>
              Snap<span className="text-sky-400">Flip</span>
            </Link>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
              Premium physical-feel digital flipbooks designed specifically for independent photographers, studios, and visual creators.
            </p>
          </div>

          {/* Directory Column 1 */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest mb-4">Application</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/create" className="hover:text-white transition-colors">
                  Create Album
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-white transition-colors">
                  Pricing Plans
                </Link>
              </li>
              <li>
                <Link to="/About" className="hover:text-white transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/Contact" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Directory Column 2 */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest mb-4">Company</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#about" className="hover:text-white transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#blog" className="hover:text-white transition-colors">
                  Journal
                </a>
              </li>
              <li>
                <a href="#careers" className="hover:text-white transition-colors">
                  Careers
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-white transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Directory Column 3 */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest mb-4">Legal</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#terms" className="hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#cookies" className="hover:text-white transition-colors">
                  Cookie Settings
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-900 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} SnapFlip. All rights reserved.
          </p>

          <div className="flex gap-4">
            <a href="https://twitter.com" className="h-8 w-8 rounded-lg bg-slate-900 hover:bg-slate-850 hover:text-white flex items-center justify-center transition-colors" aria-label="Twitter">
              <Globe className="h-4 w-4" />
            </a>
            <a href="https://instagram.com" className="h-8 w-8 rounded-lg bg-slate-900 hover:bg-slate-850 hover:text-white flex items-center justify-center transition-colors" aria-label="Instagram">
              <Camera className="h-4 w-4" />
            </a>
            <a href="https://github.com" className="h-8 w-8 rounded-lg bg-slate-900 hover:bg-slate-850 hover:text-white flex items-center justify-center transition-colors" aria-label="GitHub">
              <Send className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
