import { Link, NavLink } from 'react-router-dom'
import { Camera, Settings } from 'lucide-react'

function Navbar() {
  return (
    <header className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
      <Link to="/" className="font-display text-3xl font-bold text-white">
        SnapFlip
      </Link>
      <nav className="hidden items-center gap-5 text-sm text-slate-300 sm:flex">
        <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'text-sky-300' : 'hover:text-white')}>
          Dashboard
        </NavLink>
        <NavLink to="/pricing" className={({ isActive }) => (isActive ? 'text-sky-300' : 'hover:text-white')}>
          Pricing
        </NavLink>
      </nav>
      <div className="flex items-center gap-2">
        <Link to="/create" className="primary-button">
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
    </header>
  )
}

export default Navbar
