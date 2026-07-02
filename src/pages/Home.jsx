import { Link } from 'react-router-dom'
import { ArrowRight, Music, Share2, Upload } from 'lucide-react'
import FlipbookViewer from '../components/FlipbookViewer.jsx'
import Navbar from '../components/Navbar.jsx'
import { demoImages } from '../data/demoContent.js'

function Home() {
  return (
    <main className="min-h-svh text-white">
      <Navbar />
      <section className="mx-auto grid min-h-[calc(100svh-5rem)] w-full max-w-7xl items-center gap-8 px-4 pb-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase text-sky-300">For Indian wedding photographers</p>
          <h1 className="font-display mt-4 text-5xl font-bold leading-tight text-white sm:text-6xl">
            SnapFlip
          </h1>
          <p className="mt-5 text-xl text-slate-300">
            Your wedding photos deserve better than a Drive link.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/create" className="primary-button">
              Create Your First Flipbook Free
              <ArrowRight size={18} />
            </Link>
            <Link to="/dashboard" className="secondary-button">
              View Dashboard
            </Link>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {[
              [Upload, 'Upload', 'Add wedding photos'],
              [Music, 'Customize', 'Pick music and details'],
              [Share2, 'Share', 'Send link or QR'],
            ].map(([Icon, title, text]) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <Icon className="text-sky-300" size={22} />
                <h2 className="mt-3 font-semibold text-white">{title}</h2>
                <p className="mt-1 text-sm text-slate-400">{text}</p>
              </div>
            ))}
          </div>
        </div>
        <FlipbookViewer
          images={demoImages.flatMap((image) => [image, image])}
          title="Cinematic Wedding Albums"
          photographerName="Live demo"
        />
      </section>
    </main>
  )
}

export default Home
