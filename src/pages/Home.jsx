import { Link } from 'react-router-dom'
import { ArrowRight, Music, Share2, Upload } from 'lucide-react'
import FlipbookViewer from '../components/FlipbookViewer.jsx'
import Navbar from '../components/Navbar.jsx'
import { demoImages } from '../data/demoContent.js'

function Home() {
  return (
    <main className="relative min-h-svh text-white overflow-x-hidden">
      <div className="absolute top-0 left-0 right-0 z-50">
        <Navbar />
      </div>
      <section className="grid min-h-screen w-full items-stretch lg:grid-cols-[0.95fr_1.05fr]">
        <div className="flex flex-col justify-center max-w-2xl justify-self-center px-4 pt-24 pb-10 sm:px-6 lg:pl-12 lg:pr-8 w-full">
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
        <div className="relative w-full h-[80vh] lg:h-screen flex items-stretch">
          <FlipbookViewer
            images={demoImages.flatMap((image) => [image, image])}
            title="Cinematic Wedding Albums"
            photographerName="Live demo"
            musicFile="romantic-piano.mp3"
            className="!h-full !w-full !rounded-none !border-0 flex flex-col justify-between"
          />
        </div>
      </section>
    </main>
  )
}

export default Home
