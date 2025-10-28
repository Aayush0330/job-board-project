'use client'

import Link from 'next/link'
import { UserButton, useUser } from '@clerk/nextjs'
import { Briefcase } from 'lucide-react'

export default function Navbar() {
  const { isSignedIn } = useUser()

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-[#E8F4FF]/70 via-[#BEE3FF]/60 to-[#002E6E]/40 backdrop-blur-md border-b border-[#DCEBFF]/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-extrabold text-xl text-[#002E6E] hover:text-[#007BFF] transition-colors duration-300"
          >
            <Briefcase className="w-6 h-6 text-[#007BFF]" />
            Job<span className="text-[#3DBDFF]">Board</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/jobs"
              className="text-[#002E6E] hover:text-[#007BFF] font-medium transition duration-300"
            >
              Browse Jobs
            </Link>

            {isSignedIn && (
              <Link
                href="/add-job"
                className="text-[#002E6E] hover:text-[#3DBDFF] font-medium transition duration-300"
              >
                Post Job
              </Link>
            )}

            <Link
              href="/dashboard"
              className="text-[#002E6E] hover:text-[#001B40] font-medium transition duration-300"
            >
              Dashboard
            </Link>
          </div>

          {/* Auth Section */}
          <div className="flex items-center gap-3">
            {isSignedIn ? (
              <UserButton afterSignOutUrl="/" />
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="text-[#002E6E] font-medium hover:text-[#007BFF] transition duration-300"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="bg-gradient-to-r from-[#007BFF] via-[#3DBDFF] to-[#002E6E] text-white font-semibold px-4 py-2 rounded-xl shadow-md hover:opacity-90 transition-all duration-300"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
