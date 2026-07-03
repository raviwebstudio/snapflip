import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Camera } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    if (location.pathname === "/") {
      e.preventDefault();
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
      setIsOpen(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-900/55 bg-slate-950/85 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl tracking-tight">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-[#0B3037] text-white">
                <Camera className="h-5 w-5" />
              </div>
              Snap<span className="text-sky-400">Flip</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Home
            </Link>
            <Link
              to="/#pricing-section"
              onClick={(e) => handleScroll(e, "pricing-section")}
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Pricing
            </Link>
            <Link
              to="/#faq-section"
              onClick={(e) => handleScroll(e, "faq-section")}
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              FAQ
            </Link>
            <Link to="/about" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Contact
            </Link>
            <Link to="/dashboard" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Dashboard
            </Link>
          </div>

          {/* Action Button */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/create"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-sky-500 px-4 text-sm font-semibold text-slate-950 shadow-sm hover:bg-sky-400 transition-colors"
            >
              Create Album
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-slate-400 hover:bg-slate-900 hover:text-white focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div className="md:hidden border-b border-slate-900 bg-slate-950/95 px-4 pt-2 pb-4 space-y-1">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="block rounded-md px-3 py-2 text-base font-medium text-slate-300 hover:bg-slate-900 hover:text-white"
          >
            Home
          </Link>
          <Link
            to="/#pricing-section"
            onClick={(e) => handleScroll(e, "pricing-section")}
            className="block rounded-md px-3 py-2 text-base font-medium text-slate-300 hover:bg-slate-900 hover:text-white"
          >
            Pricing
          </Link>
          <Link
            to="/#faq-section"
            onClick={(e) => handleScroll(e, "faq-section")}
            className="block rounded-md px-3 py-2 text-base font-medium text-slate-300 hover:bg-slate-900 hover:text-white"
          >
            FAQ
          </Link>
          <Link
            to="/about"
            onClick={() => setIsOpen(false)}
            className="block rounded-md px-3 py-2 text-base font-medium text-slate-300 hover:bg-slate-900 hover:text-white"
          >
            About
          </Link>
          <Link
            to="/contact"
            onClick={() => setIsOpen(false)}
            className="block rounded-md px-3 py-2 text-base font-medium text-slate-300 hover:bg-slate-900 hover:text-white"
          >
            Contact
          </Link>
          <Link
            to="/dashboard"
            onClick={() => setIsOpen(false)}
            className="block rounded-md px-3 py-2 text-base font-medium text-slate-300 hover:bg-slate-900 hover:text-white"
          >
            Dashboard
          </Link>
          <div className="pt-4">
            <Link
              to="/create"
              onClick={() => setIsOpen(false)}
              className="block w-full text-center rounded-md bg-sky-500 py-2.5 text-sm font-semibold text-slate-950 hover:bg-sky-400"
            >
              Create Album
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
