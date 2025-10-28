'use client'

import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Zap, Users, TrendingUp, ArrowRight } from 'lucide-react'

export default function Home() {
  const { isSignedIn } = useUser()

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#002A66] via-[#0047B3] to-[#0066FF] text-white">
      {/* Hero Section */}
      <section className="relative px-4 py-24 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          {/* Badge */}
          <Badge className="inline-block mb-4 bg-[#33A3FF]/20 text-[#33A3FF] border border-[#33A3FF]/30">
            ⚡ The Future of Hiring
          </Badge>

          {/* Heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Find Your{' '}
            <span className="bg-gradient-to-r from-[#63CCFF] to-[#0066FF] bg-clip-text text-transparent">
              Dream Job
            </span>{' '}
            Today
          </h1>

          {/* Subheading */}
          <p className="text-xl sm:text-2xl text-white/90 mb-10 max-w-2xl mx-auto">
            Connect with top companies and start your journey with the most trusted job platform.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/jobs">
              <Button className="bg-[#0066FF] hover:bg-[#0047B3] text-white font-semibold py-3 px-8 rounded-lg text-lg w-full sm:w-auto shadow-lg shadow-blue-500/20 transition-all">
                Browse Jobs
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>

            <Link href="/add-job">
              <Button variant="outline" className="border-2 border-[#63CCFF] text-[#63CCFF] hover:bg-[#63CCFF]/10 font-semibold py-3 px-8 rounded-lg text-lg w-full sm:w-auto">
                Post a Job
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 hover:scale-105 transition">
              <div className="text-4xl font-bold text-[#63CCFF] mb-2">10K+</div>
              <p className="text-white/80">Active Jobs</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 hover:scale-105 transition">
              <div className="text-4xl font-bold text-[#33A3FF] mb-2">50K+</div>
              <p className="text-white/80">Job Seekers</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 hover:scale-105 transition">
              <div className="text-4xl font-bold text-[#0066FF] mb-2">100+</div>
              <p className="text-white/80">Companies</p>
            </div>
          </div>
        </div>

        {/* Subtle background glow */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-[#63CCFF]/20 to-[#0047B3]/20 blur-3xl"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-24 sm:px-6 lg:px-8 bg-[#002A66]/80">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-[#63CCFF] mb-12 text-center">
            Why Choose Us?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 border border-white/20 rounded-xl p-8 hover:bg-[#0066FF]/10 transition">
              <Zap className="w-12 h-12 text-[#63CCFF] mb-4" />
              <h3 className="text-xl font-semibold mb-3">Lightning Fast</h3>
              <p className="text-white/80">Find jobs instantly with our smart matching system.</p>
            </div>

            <div className="bg-white/10 border border-white/20 rounded-xl p-8 hover:bg-[#33A3FF]/10 transition">
              <Users className="w-12 h-12 text-[#33A3FF] mb-4" />
              <h3 className="text-xl font-semibold mb-3">Community Driven</h3>
              <p className="text-white/80">Connect with thousands of professionals and employers.</p>
            </div>

            <div className="bg-white/10 border border-white/20 rounded-xl p-8 hover:bg-[#63CCFF]/10 transition">
              <TrendingUp className="w-12 h-12 text-[#63CCFF] mb-4" />
              <h3 className="text-xl font-semibold mb-3">Career Growth</h3>
              <p className="text-white/80">Get career insights and grow with trusted companies.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 bg-gradient-to-r from-[#33A3FF] to-[#0047B3]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-white">
            Ready to Begin Your Journey?
          </h2>
          <p className="text-lg text-white/90 mb-8">
            {isSignedIn
              ? "Explore thousands of opportunities tailored for you."
              : "Sign up now and start discovering your dream job today!"}
          </p>
          <Link href={isSignedIn ? "/jobs" : "/sign-up"}>
            <Button className="bg-white text-[#0047B3] hover:bg-blue-100 font-bold py-3 px-8 rounded-lg text-lg">
              Get Started
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
