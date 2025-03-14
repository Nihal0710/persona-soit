"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Badge } from "@/components/ui/badge"
import LoadingScreen from "@/components/loading-screen"
import { ChevronRight, ArrowRight, Menu, X } from "lucide-react"
import ContactForm from "@/components/contact-form"
import NewsletterForm from "@/components/newsletter-form"

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0f172a]">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-indigo-900/20 bg-[#0f172a]/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/personalogo.jpg-GdsYkYNMf4zntjjLwNSjCeX2jMSltt.jpeg"
              alt="The Persona Logo"
              width={40}
              height={40}
              className="rounded-full"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 text-transparent bg-clip-text">
              <span className="md:hidden">The Persona</span>
              <span className="hidden md:inline">The Personality Grooming Club</span>
            </span>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white p-2 hover:bg-indigo-900/20 rounded-md transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-white/80 transition-colors hover:text-white">
              Home
            </Link>
            <Link href="#events" className="text-sm font-medium text-white/80 transition-colors hover:text-white">
              Event
            </Link>
            <Link href="#" className="text-sm font-medium text-white/80 transition-colors hover:text-white">
              Gallery
            </Link>
            <Link href="/quiz" className="text-sm font-medium text-white/80 transition-colors hover:text-white">
              Quiz
            </Link>
            <Link href="#contact" className="text-sm font-medium text-white/80 transition-colors hover:text-white">
              Contact
            </Link>
          </nav>

          {/* Desktop Join Button */}
          <Button className="hidden md:flex bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-md">
            Join Now
          </Button>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-full left-0 right-0 bg-[#0f172a]/95 border-b border-indigo-900/20 py-4 backdrop-blur"
            >
              <nav className="container flex flex-col gap-4">
                <Link
                  href="/"
                  className="text-sm font-medium text-white/80 transition-colors hover:text-white hover:bg-indigo-900/20 px-4 py-2 rounded-md"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="#events"
                  className="text-sm font-medium text-white/80 transition-colors hover:text-white hover:bg-indigo-900/20 px-4 py-2 rounded-md"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Event
                </Link>
                <Link
                  href="#"
                  className="text-sm font-medium text-white/80 transition-colors hover:text-white hover:bg-indigo-900/20 px-4 py-2 rounded-md"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Gallery
                </Link>
                <Link
                  href="/quiz"
                  className="text-sm font-medium text-white/80 transition-colors hover:text-white hover:bg-indigo-900/20 px-4 py-2 rounded-md"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Quiz
                </Link>
                <Link
                  href="#contact"
                  className="text-sm font-medium text-white/80 transition-colors hover:text-white hover:bg-indigo-900/20 px-4 py-2 rounded-md"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Contact
                </Link>
                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-md mx-4">
                  Join Now
                </Button>
              </nav>
            </motion.div>
          )}
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-12 md:py-32">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-[#0f172a] opacity-90"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-purple-900/20"></div>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
          </div>

          <div className="container relative z-10 grid gap-8 md:grid-cols-2 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6 text-center md:text-left"
            >
              <Badge className="px-3 py-1 bg-indigo-900/30 text-indigo-300 hover:bg-indigo-900/40 transition-colors">
                Welcome to Persona
              </Badge>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white">
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                  Unlock Your{" "}
                </motion.span>
                <motion.div
                  className="inline-block"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  <motion.span
                    className="inline-block bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 text-transparent bg-clip-text"
                    animate={{
                      backgroundPosition: ["0% center", "100% center", "0% center"],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                  >
                    True Potential
                  </motion.span>
                </motion.div>
              </h1>
              <p className="text-base md:text-lg text-white/70">
                At Persona Club, We Believe In The Power Of Individuality And The Art Of Personal Growth. Our Mission Is
                To Help You Unlock Your True Potential, Refine Your Skills, And Present The Best Version Of Yourself To
                The World.
              </p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-md w-full md:w-auto">
                  Join Our Community
                </Button>
                <Button variant="outline" className="border-indigo-500/50 text-white hover:bg-indigo-950/50 w-full md:w-auto">
                  Persona Magazine
                </Button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex justify-center"
            >
              <div className="relative">
                <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 opacity-75 blur-sm"></div>
                <div className="relative">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/personalogo.jpg-GdsYkYNMf4zntjjLwNSjCeX2jMSltt.jpeg"
                    alt="Persona Logo"
                    width={400}
                    height={400}
                    className="rounded-full"
                  />
                </div>
                <motion.div
                  className="absolute -inset-1 rounded-full border border-indigo-500/30"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                ></motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Our Vision Section */}
        <section className="py-20 bg-gradient-to-b from-[#0f172a] to-[#131c31]">
          <div className="container grid gap-8 md:grid-cols-2 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <Badge className="px-3 py-1 bg-purple-900/30 text-purple-300 hover:bg-purple-900/40 transition-colors">
                Our Vision
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-white">Empowering Personal Excellence</h2>
              <p className="text-white/70">
                PERSONA fosters self-improvement and professional development in a supportive environment. Our platform
                enables members to share tips, exchange resources, and support each other's growth. Members collaborate,
                grow, and network through discussions and workshops in a supportive atmosphere. The goal is collective
                growth and success through shared experiences and insights.
              </p>
              <Button className="group bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-md">
                <span>Join Our Community</span>
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="flex justify-center"
            >
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/CorporateGrooming%20Intro.ai%20%284%29-6niu0nzS3dWLcBPClTfPysJXf8XOeM.png"
                alt="Corporate Grooming"
                width={500}
                height={400}
                className="rounded-lg shadow-xl shadow-indigo-900/20"
              />
            </motion.div>
          </div>
        </section>

        {/* Upcoming Events */}
        <section id="events" className="py-20 bg-gradient-to-b from-[#131c31] to-[#0f172a]">
          <div className="container">
            <div className="text-center mb-12">
              <Badge className="px-3 py-1 bg-blue-900/30 text-blue-300 hover:bg-blue-900/40 transition-colors">
                What's Happening
              </Badge>
              <h2 className="mt-3 text-3xl md:text-4xl font-bold text-white">Upcoming Events</h2>
              <div className="mt-2 h-1 w-20 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
            </div>

            <Carousel className="w-full">
              <CarouselContent>
                {[1, 2, 3].map((item) => (
                  <CarouselItem key={item} className="md:basis-1/2 lg:basis-1/3">
                    <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
                      <Card className="bg-[#1a2234] border-[#2a3348] text-white overflow-hidden">
                        <div className="aspect-video relative">
                          <Image
                            src={`/placeholder.svg?height=200&width=400`}
                            alt="Event"
                            width={400}
                            height={200}
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#1a2234] to-transparent"></div>
                        </div>
                        <CardContent className="p-6">
                          <Badge className="bg-indigo-900/50 hover:bg-indigo-900/70 text-indigo-300">
                            MAY 15, 2024
                          </Badge>
                          <h3 className="text-xl font-bold mt-3 mb-2">Summer Night Gala</h3>
                          <p className="text-gray-300 mb-4">
                            Join us for an evening of networking, inspiration, and celebration of personal growth
                            achievements.
                          </p>
                          <Button variant="link" className="p-0 text-indigo-400 hover:text-indigo-300">
                            <span>Learn more</span>
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2 bg-black/50 text-white border-none hover:bg-black/70" />
              <CarouselNext className="right-2 bg-black/50 text-white border-none hover:bg-black/70" />
            </Carousel>
          </div>
        </section>

        {/* Meet Our Communities */}
        <section className="py-20 bg-gradient-to-b from-[#0f172a] to-[#131c31]">
          <div className="container">
            <div className="text-center mb-12">
              <Badge className="px-3 py-1 bg-purple-900/30 text-purple-300 hover:bg-purple-900/40 transition-colors">
                Our Communities
              </Badge>
              <h2 className="mt-3 text-3xl md:text-4xl font-bold text-white">Meet Our Communities</h2>
              <div className="mt-2 h-1 w-20 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
            </div>

            <Tabs defaultValue="finance" className="w-full">
              <div className="relative">
                <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-2 md:grid-cols-4 bg-[#1a2234] mb-8 overflow-x-auto relative">
                  <TabsTrigger 
                    value="finance" 
                    className="data-[state=active]:bg-indigo-900/50 min-w-[120px] relative z-10 transition-all duration-300"
                  >
                    Finance
                  </TabsTrigger>
                  <TabsTrigger 
                    value="corporate" 
                    className="data-[state=active]:bg-indigo-900/50 min-w-[120px] relative z-10 transition-all duration-300"
                  >
                    Corporate
                  </TabsTrigger>
                  <TabsTrigger 
                    value="leadership" 
                    className="data-[state=active]:bg-indigo-900/50 min-w-[120px] relative z-10 transition-all duration-300"
                  >
                    Leadership
                  </TabsTrigger>
                  <TabsTrigger 
                    value="creative" 
                    className="data-[state=active]:bg-indigo-900/50 min-w-[120px] relative z-10 transition-all duration-300"
                  >
                    Creative
                  </TabsTrigger>
                </TabsList>
              </div>

              <motion.div
                initial={false}
                className="relative"
              >
                <TabsContent 
                  value="finance"
                  className="absolute w-full"
                  asChild
                >
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="bg-gradient-to-br from-[#1a2234] to-[#131c31] border-indigo-900/20 text-white overflow-hidden">
                      <CardContent className="p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center">
                        <div className="relative flex-shrink-0">
                          <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 opacity-50 blur"></div>
                          <Image
                            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/CorporateGrooming%20Intro.ai%20%284%29-6niu0nzS3dWLcBPClTfPysJXf8XOeM.png"
                            alt="Finance And Management"
                            width={300}
                            height={300}
                            className="rounded-lg relative"
                          />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
                            Finance And Management Community
                          </h3>
                          <p className="text-white/70 mb-4">
                            Our Finance and Management community brings together professionals and enthusiasts to share
                            knowledge, discuss market trends, and develop financial literacy. Members benefit from
                            workshops, guest speakers, and networking opportunities that enhance their understanding of
                            financial management principles.
                          </p>
                          <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-md">
                            Join Community
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>

                <TabsContent 
                  value="corporate"
                  className="absolute w-full"
                  asChild
                >
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="bg-gradient-to-br from-[#1a2234] to-[#131c31] border-indigo-900/20 text-white overflow-hidden">
                      <CardContent className="p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center">
                        <div className="relative flex-shrink-0">
                          <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 opacity-50 blur"></div>
                          <Image
                            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/CorporateGrooming%20Intro.ai%20%284%29-6niu0nzS3dWLcBPClTfPysJXf8XOeM.png"
                            alt="Corporate Grooming"
                            width={300}
                            height={300}
                            className="rounded-lg relative"
                          />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
                            Corporate Grooming Community
                          </h3>
                          <p className="text-white/70 mb-4">
                            The Corporate Grooming community focuses on professional etiquette, communication skills, and
                            personal branding. Through interactive sessions and practical exercises, members learn to
                            navigate corporate environments with confidence and polish, enhancing their career prospects and
                            professional relationships.
                          </p>
                          <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-md">
                            Join Community
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>

                <TabsContent 
                  value="leadership"
                  className="absolute w-full"
                  asChild
                >
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="bg-gradient-to-br from-[#1a2234] to-[#131c31] border-indigo-900/20 text-white overflow-hidden">
                      <CardContent className="p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center">
                        <div className="relative flex-shrink-0">
                          <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 opacity-50 blur"></div>
                          <Image
                            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/CorporateGrooming%20Intro.ai%20%284%29-6niu0nzS3dWLcBPClTfPysJXf8XOeM.png"
                            alt="Leadership Development"
                            width={300}
                            height={300}
                            className="rounded-lg relative"
                          />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
                            Leadership Development Community
                          </h3>
                          <p className="text-white/70 mb-4">
                            Our Leadership Development community cultivates essential leadership skills through mentorship,
                            case studies, and collaborative projects. Members explore different leadership styles, conflict
                            resolution, and team management techniques that prepare them for leadership roles in various
                            contexts.
                          </p>
                          <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-md">
                            Join Community
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>

                <TabsContent 
                  value="creative"
                  className="absolute w-full"
                  asChild
                >
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="bg-gradient-to-br from-[#1a2234] to-[#131c31] border-indigo-900/20 text-white overflow-hidden">
                      <CardContent className="p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center">
                        <div className="relative flex-shrink-0">
                          <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 opacity-50 blur"></div>
                          <Image
                            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/CorporateGrooming%20Intro.ai%20%284%29-6niu0nzS3dWLcBPClTfPysJXf8XOeM.png"
                            alt="Creative Arts"
                            width={300}
                            height={300}
                            className="rounded-lg relative"
                          />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
                            Creative Arts Community
                          </h3>
                          <p className="text-white/70 mb-4">
                            The Creative Arts community provides a platform for artistic expression and collaboration.
                            Members share their creative works, receive constructive feedback, and participate in workshops
                            that enhance their artistic skills. This community celebrates diversity in creative expression
                            and encourages innovative thinking.
                          </p>
                          <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-md">
                            Join Community
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>
              </motion.div>
            </Tabs>
          </div>
        </section>

        {/* Meet Our Team */}
        <section className="py-20 bg-gradient-to-b from-[#131c31] to-[#0f172a]">
          <div className="container">
            <div className="text-center mb-12">
              <Badge className="px-3 py-1 bg-blue-900/30 text-blue-300 hover:bg-blue-900/40 transition-colors">
                Our People
              </Badge>
              <h2 className="mt-3 text-3xl md:text-4xl font-bold text-white">Meet Our Team</h2>
              <div className="mt-2 h-1 w-20 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
              <p className="mt-4 max-w-3xl mx-auto text-white/70">
                Our dedicated team of coordinators and volunteers work together to create meaningful experiences and
                foster personal growth for all our members.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
                <Card className="bg-gradient-to-br from-[#1a2234] to-[#131c31] border-indigo-900/20 text-white h-full">
                  <CardContent className="p-8 flex flex-col items-center justify-center h-full">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mb-4">
                      <span className="text-2xl font-bold">EC</span>
                    </div>
                    <h3 className="text-2xl font-bold text-center mb-3">Executive Coordinators</h3>
                    <p className="text-white/70 text-center">
                      Our executive team leads with vision and dedication, ensuring the club's activities align with our
                      mission.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
                <Card className="bg-gradient-to-br from-[#1a2234] to-[#131c31] border-indigo-900/20 text-white h-full">
                  <CardContent className="p-8 flex flex-col items-center justify-center h-full">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mb-4">
                      <span className="text-2xl font-bold">SC</span>
                    </div>
                    <h3 className="text-2xl font-bold text-center mb-3">Student Coordinators</h3>
                    <p className="text-white/70 text-center">
                      Student coordinators organize events and facilitate community engagement with enthusiasm and
                      creativity.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
                <Card className="bg-gradient-to-br from-[#1a2234] to-[#131c31] border-indigo-900/20 text-white h-full">
                  <CardContent className="p-8 flex flex-col items-center justify-center h-full">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mb-4">
                      <span className="text-2xl font-bold">SV</span>
                    </div>
                    <h3 className="text-2xl font-bold text-center mb-3">Student Volunteers</h3>
                    <p className="text-white/70 text-center">
                      Our volunteers contribute their time and talents to support club activities and help fellow
                      members grow.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <div className="mt-12 text-center">
              <Button variant="outline" className="border-indigo-500/50 text-white hover:bg-indigo-950/50">
                Meet The Full Team
              </Button>
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section id="contact" className="py-20 bg-gradient-to-b from-[#0f172a] to-black">
          <div className="container max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                <Badge className="px-3 py-1 bg-purple-900/30 text-purple-300 hover:bg-purple-900/40 transition-colors">
                  Contact Us
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-white">Get In Touch</h2>
                <p className="text-white/70">
                  Have questions or want to join our community? Reach out to us and we'll get back to you as soon as
                  possible.
                </p>

                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-3 text-white/70">
                    <div className="w-10 h-10 rounded-full bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                      <span>📍</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-white">Address</h4>
                      <p>SOIT RGPV University, Bhopal</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-white/70">
                    <div className="w-10 h-10 rounded-full bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                      <span>📞</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-white">Phone</h4>
                      <p>+1 234 567 890</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-white/70">
                    <div className="w-10 h-10 rounded-full bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                      <span>📧</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-white">Email</h4>
                      <p>personasoit@gmail.com</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <ContactForm />
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-black text-white py-12">
        <div className="container grid gap-8 md:gap-12 grid-cols-1 md:grid-cols-3">
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  Events
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  Membership
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
              Contact Info
            </h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-gray-400">
                <span>📍</span> SOIT RGPV University, Bhopal
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <span>📞</span> +1 234 567 890
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <span>📧</span> personasoit@gmail.com
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
              Newsletter
            </h3>
            <div className="space-y-4">
              <NewsletterForm />
            </div>
          </div>
        </div>

        <div className="container mt-12 pt-6 border-t border-gray-800">
          <p className="text-center text-gray-500">©2025 The Personality Grooming Club. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  )
}

