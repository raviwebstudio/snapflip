import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Camera, Menu, Settings, X } from 'lucide-react'

function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0b3037]/80 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] w-full max-w-[1440px] items-center justify-between px-4 md:px-6 lg:px-10">
        {/* Left: Logo */}
        <Link to="/" className="font-display text-3xl font-bold text-white transition hover:opacity-90">
          SnapFlip
        </Link>

        {/* Center: Links (Hidden on mobile, visible on tablet/desktop) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'text-sky-300' : 'hover:text-white transition')}>
            Dashboard
          </NavLink>
          <NavLink to="/pricing" className={({ isActive }) => (isActive ? 'text-sky-300' : 'hover:text-white transition')}>
            Pricing
          </NavLink>
          <NavLink to="/features" className={({ isActive }) => (isActive ? 'text-sky-300' : 'hover:text-white transition')}>
            Features
          </NavLink>
          <NavLink to="/templates" className={({ isActive }) => (isActive ? 'text-sky-300' : 'hover:text-white transition')}>
            Templates
          </NavLink>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3">
            <Link to="/create" className="primary-button h-10 px-4">
              <Camera size={17} />
              Create
            </Link>
            <Link to="/dashboard" className="icon-button" aria-label="Settings">
              <Settings size={18} />
            </Link>
            <span className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/10 text-sm font-semibold">
              RS
            </span>
          </div>

          {/* Hamburger Menu button */}
          <button
            type="button"
            className="flex md:hidden icon-button"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#0b3037] px-4 py-4 space-y-4">
          <nav className="flex flex-col gap-3 text-base font-medium text-slate-300">
            <NavLink
              to="/dashboard"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => (isActive ? 'text-sky-300' : 'hover:text-white')}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/pricing"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => (isActive ? 'text-sky-300' : 'hover:text-white')}
            >
              Pricing
            </NavLink>
            <NavLink
              to="/features"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => (isActive ? 'text-sky-300' : 'hover:text-white')}
            >
              Features
            </NavLink>
            <NavLink
              to="/templates"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => (isActive ? 'text-sky-300' : 'hover:text-white')}
            >
              Templates
            </NavLink>
          </nav>
          <div className="flex items-center gap-3 pt-3 border-t border-white/10 sm:hidden">
            <Link to="/create" onClick={() => setIsOpen(false)} className="primary-button h-10 px-4 w-full justify-center">
              <Camera size={17} />
              Create
            </Link>
            <Link to="/dashboard" onClick={() => setIsOpen(false)} className="icon-button" aria-label="Settings">
              <Settings size={18} />
            </Link>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 bg-white/10 text-sm font-semibold">
              RS
            </span>
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
