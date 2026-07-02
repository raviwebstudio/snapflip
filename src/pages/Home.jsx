import { Link } from 'react-router-dom'
import { ArrowRight, Music, Share2, Upload } from 'lucide-react'
import FlipbookViewer from '../components/FlipbookViewer.jsx'
import Navbar from '../components/Navbar.jsx'
import { demoImages } from '../data/demoContent.js'

function Home() {
  return (
    <main className="min-h-svh text-white">
      <Navbar />
      
      <section className="grid w-full items-stretch gap-10 xl:gap-12 grid-cols-1 xl:grid-cols-[0.95fr_1.05fr] pt-14 lg:pt-16 pb-12 max-w-[1440px] mx-auto px-4 md:px-6 lg:px-10">
        {/* Left Column: Copy and CTA */}
        <div className="flex flex-col justify-center max-w-2xl xl:max-w-none justify-self-center xl:justify-self-stretch w-full py-6">
          <p className="text-sm font-semibold uppercase text-sky-300 mb-4 tracking-wider">SNAPFLIP ALBUM</p>
          <h1 className="font-display text-5xl font-bold leading-tight text-white sm:text-6xl">
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
          <div className="mt-10 grid gap-3 grid-cols-1 sm:grid-cols-3">
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

        {/* Right Column: Interactive Flipbook Viewer */}
        <div className="relative w-full h-[55vh] md:h-[65vh] xl:h-[calc(100vh-128px)] flex items-stretch">
          <FlipbookViewer
            images={demoImages.flatMap((image) => [image, image])}
            title="Cinematic Wedding Albums"
            photographerName="Live demo"
            musicFile="romantic-piano.mp3"
            className="!h-full !w-full flex flex-col justify-between"
          />
        </div>
      </section>
    </main>
  )
}

export default Home
