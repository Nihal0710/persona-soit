"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 4
      })
    }, 200)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 bg-[#0f172a] flex flex-col items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="relative w-40 h-40 mx-auto mb-8">
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.05, 1],
            }}
            transition={{
              rotate: { duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
              scale: { duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
            }}
            className="w-40 h-40 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center"
          >
            <div className="w-36 h-36 rounded-full bg-[#0f172a] flex items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 opacity-50 flex items-center justify-center">
                <div className="w-28 h-28 rounded-full bg-[#0f172a] flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 opacity-30 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-[#0f172a]"></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.h1
          className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 text-transparent bg-clip-text"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        >
          The Personality Grooming Club
        </motion.h1>

        <div className="w-100 h-2 bg-gray-800 rounded-full overflow-hidden mt-6">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-600 to-purple-600"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>

        <p className="text-white/70 mt-3">Loading experience... {progress}%</p>
      </motion.div>
    </div>
  )
}

