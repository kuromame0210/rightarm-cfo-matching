'use client'

import Header from '../components/Header'
import Hero from '../components/Hero'
import RegistrationCTA from '../components/RegistrationCTA'
import Footer from '../components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <RegistrationCTA />
      <Footer />
    </main>
  )
}