"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0)
  const [particles, setParticles] = useState<Array<{ x: number; y: number; size: number; color: string; speed: number }>>([])

  // Generate random particles
  useEffect(() => {
    const colors = ["#4f46e5", "#7e22ce", "#a855f7", "#6366f1", "#8b5cf6"]
    const newParticles = Array.from({ length: 30 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: Math.random() * 2 + 0.5,
    }))
    setParticles(newParticles)
  }, [])

  // Progress bar animation - completes in exactly 3 seconds
  useEffect(() => {
    const totalDuration = 3000 // 3 seconds in milliseconds
    const steps = 100 // Total steps to reach 100%
    const interval = totalDuration / steps // Time between each step

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer)
          return 100
        }
        return prev + 1
      })
    }, interval)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="fixed inset-0 bg-[#0f172a] flex flex-col items-center justify-center z-50 overflow-hidden">
      {/* Animated particles */}
      {particles.map((particle, index) => (
        <motion.div
          key={index}
          className="absolute rounded-full"
          initial={{
            x: `${particle.x}vw`,
            y: `${particle.y}vh`,
            opacity: 0,
          }}
          animate={{
            x: `${particle.x + (Math.random() * 10 - 5)}vw`,
            y: `${particle.y - particle.speed * 10}vh`,
            opacity: [0, 0.7, 0],
          }}
          transition={{
            duration: 3,
            ease: "easeOut",
            times: [0, 0.5, 1],
            repeat: Infinity,
            repeatType: "loop",
          }}
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
          }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center z-10"
      >
        <div className="relative w-40 h-40 mx-auto mb-8">
          <motion.div
            initial={{ rotate: 0 }}
            animate={{
              rotate: 360,
              scale: [1, 1.05, 1],
              boxShadow: [
                "0 0 0 0 rgba(99, 102, 241, 0)",
                "0 0 20px 10px rgba(99, 102, 241, 0.3)",
                "0 0 0 0 rgba(99, 102, 241, 0)",
              ],
            }}
            transition={{
              rotate: { duration: 3, repeat: Infinity, ease: "linear", repeatType: "loop" },
              scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut", repeatType: "reverse" },
              boxShadow: { duration: 1.5, repeat: Infinity, ease: "easeInOut", repeatType: "reverse" },
            }}
            className="w-40 h-40 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center"
          >
            <div className="w-36 h-36 rounded-full bg-[#0f172a] flex items-center justify-center">
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ 
                  rotate: -360,
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  rotate: { duration: 3, repeat: Infinity, ease: "linear", repeatType: "loop" },
                  scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut", repeatType: "reverse" },
                }}
                className="w-32 h-32 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 opacity-50 flex items-center justify-center"
              >
                <div className="w-28 h-28 rounded-full bg-[#0f172a] flex items-center justify-center">
                  <motion.div
                    initial={{ rotate: 0 }}
                    animate={{ 
                      rotate: 360,
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      rotate: { duration: 3, repeat: Infinity, ease: "linear", repeatType: "loop" },
                      opacity: { duration: 1.5, repeat: Infinity, ease: "easeInOut", repeatType: "reverse" },
                    }}
                    className="w-24 h-24 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 opacity-30 flex items-center justify-center"
                  >
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut", repeatType: "reverse" },
                      }}
                      className="w-20 h-20 rounded-full bg-[#0f172a] flex items-center justify-center"
                    >
                      <motion.div
                        initial={{ opacity: 0, scale: 0, rotate: 0 }}
                        animate={{ 
                          opacity: 1,
                          scale: 1,
                          rotate: 360,
                        }}
                        transition={{
                          opacity: { duration: 0.5 },
                          scale: { duration: 0.5 },
                          rotate: { duration: 3, repeat: Infinity, ease: "linear", repeatType: "loop" },
                        }}
                        className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                      />
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        <motion.h1
          className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 text-transparent bg-clip-text"
          animate={{ 
            opacity: [0.5, 1, 0.5],
            scale: [0.95, 1.05, 0.95],
          }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity, 
            ease: "easeInOut",
            repeatType: "reverse"
          }}
        >
          The Personality Grooming Club
        </motion.h1>

        <div className="w-100 h-2 bg-gray-800 rounded-full overflow-hidden mt-6 relative">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 relative"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-0 bottom-0 left-0 right-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
            animate={{ x: ["0%", "100%"] }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", repeatType: "loop" }}
          />
        </div>

        <motion.p 
          className="text-white/70 mt-3"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", repeatType: "reverse" }}
        >
          Loading experience... {progress}%
        </motion.p>
      </motion.div>
    </div>
  )
}

