import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import Navbar from '../components/Navbar.jsx'

const plans = [
  { name: 'Free', price: 'Rs.0', detail: '1 album', features: ['QR code', 'Watermark', 'No music'] },
  { name: 'Monthly', price: 'Rs.299', detail: 'per month', featured: true, features: ['Unlimited albums', 'Music', 'No watermark', 'QR code'] },
  { name: 'Yearly', price: 'Rs.2499', detail: 'per year', features: ['Unlimited albums', 'Music', 'No watermark', 'QR code'] },
]

function Pricing() {
  return (
    <main className="min-h-svh text-white">
      <Navbar />
      <section className="mx-auto max-w-6xl px-4 py-10 text-center sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase text-sky-300">Simple Pricing</p>
        <h1 className="font-display mt-2 text-5xl font-bold">Plans for every studio</h1>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`rounded-2xl border p-6 text-left ${
                plan.featured ? 'border-sky-300 bg-sky-400/10' : 'border-white/10 bg-white/5'
              }`}
            >
              {plan.featured && <p className="mb-3 text-sm font-semibold text-sky-200">Most Popular</p>}
              <h2 className="text-2xl font-semibold">{plan.name}</h2>
              <p className="mt-4 text-4xl font-bold">{plan.price}</p>
              <p className="mt-1 text-slate-400">{plan.detail}</p>
              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-slate-300">
                    <Check size={16} className="text-green-300" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link to="/create" className="primary-button mt-6 w-full justify-center">
                Start
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

export default Pricing
