"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import wingsImage from "@/components/ArkAngellogo (2).png"
import { Toaster, toast } from "sonner"

function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [percentage, setPercentage] = useState(1)

  useEffect(() => {
    const interval = setInterval(() => {
      setPercentage((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(onComplete, 1000)
          return 100
        }
        return prev + Math.random() * 8 + 2
      })
    }, 50)

    return () => clearInterval(interval)
  }, [onComplete])

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div className="text-center">
        <div className="loading-text text-6xl md:text-8xl text-white mb-4 font-mono tracking-wider">
          {Math.floor(percentage)}%
        </div>
        <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-white to-gray-300 transition-all duration-100 ease-out shadow-lg shadow-white/20"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  )
}

function WingsTransition({ onComplete }: { onComplete: () => void }) {
  const [opacity, setOpacity] = useState(0)

  useEffect(() => {
    // Fade in the wings
    const fadeInTimer = setTimeout(() => {
      setOpacity(1)
    }, 500)

    // Fade out the wings and complete transition
    const fadeOutTimer = setTimeout(() => {
      setOpacity(0)
    }, 3000)

    const completeTimer = setTimeout(() => {
      onComplete()
    }, 4500)

    return () => {
      clearTimeout(fadeInTimer)
      clearTimeout(fadeOutTimer)
      clearTimeout(completeTimer)
    }
  }, [onComplete])

  return (
    <div className="fixed inset-0 bg-black z-40 flex items-center justify-center">
      <div className="transition-opacity duration-1000 ease-in-out" style={{ opacity }}>
        <Image
          src={wingsImage}
          alt="ArkAngel Wings"
          width={800}
          height={600}
          className="invert max-w-[90vw] max-h-[90vh] object-contain"
        />
      </div>
    </div>
  )
}

function Interactive3DText({ mouse }: { mouse: { x: number; y: number } }) {
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (textRef.current) {
      const targetX = mouse.x * 2
      const targetY = mouse.y * 2

      textRef.current.style.transform = `rotateX(${targetY}deg) rotateY(${targetX}deg)`
    }
  }, [mouse])

  return (
    <div
      ref={textRef}
      className="pointer-events-none"
      style={{
        transformStyle: "preserve-3d",
        transition: "transform 0.1s ease-out",
      }}
    >
      <h1 className="text-white text-4xl font-bold tracking-wider text-center select-none">Arya</h1>
    </div>
  )
}

function WaitlistForm({ mouse }: { mouse: { x: number; y: number } }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [email, setEmail] = useState("")

  useEffect(() => {
    if (containerRef.current && isHovered) {
      const rect = containerRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const mouseX = (mouse.x * window.innerWidth) / 2 + window.innerWidth / 2
      const mouseY = (-mouse.y * window.innerHeight) / 2 + window.innerHeight / 2

      const rotateX = ((mouseY - centerY) / rect.height) * 15
      const rotateY = ((mouseX - centerX) / rect.width) * -15

      containerRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`
    } else if (containerRef.current) {
      containerRef.current.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)"
    }
  }, [mouse, isHovered])

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    ;(async () => {
      try {
        const res = await fetch('/api/waitlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        })
        if (res.status === 201) {
          toast.success('Added to waitlist')
          setEmail('')
        } else if (res.status === 409) {
          toast.info('You are already on the waitlist')
        } else {
          toast.error('Failed to join waitlist. Please try again later')
        }
      } catch (err) {
        toast.error('Network error. Please try again')
      }
    })()
  }

  return (
    <div
      ref={containerRef}
      className="transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <form
        onSubmit={onSubmit}
        className="relative flex flex-row items-stretch gap-3 bg-gradient-to-r from-gray-900 to-black border border-white/20 rounded-lg p-3 backdrop-blur-sm hover:border-white/40 transition-all duration-300"
      >
        <span className="inline-flex items-center h-10 whitespace-nowrap text-white font-mono text-sm tracking-wider leading-none select-none">Join Waitlist</span>
        <div className="flex w-full sm:w-auto items-center gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-64 sm:w-56 h-10 px-3 bg-black/60 text-white placeholder-gray-400 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-white/40"
          />
          <button
            type="submit"
            className="h-10 px-4 bg-white text-black rounded-md font-medium hover:bg-gray-200 transition-colors"
          >
            Join
          </button>
        </div>
      </form>
    </div>
  )
}

export default function InteractiveWebsite() {
  const [stage, setStage] = useState<"loading" | "wings" | "main">("loading")
  const [mouse, setMouse] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMouse({
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -(event.clientY / window.innerHeight) * 2 + 1,
      })
    }

    if (stage === "main") {
      window.addEventListener("mousemove", handleMouseMove)
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [stage])

  const handleLoadingComplete = () => {
    setStage("wings")
  }

  const handleWingsComplete = () => {
    setStage("main")
  }

  return (
    <div className="w-full h-screen bg-black overflow-hidden">
      <Toaster position="bottom-center" theme="dark" richColors />
      {stage === "loading" && <LoadingScreen onComplete={handleLoadingComplete} />}

      {stage === "wings" && <WingsTransition onComplete={handleWingsComplete} />}

      {stage === "main" && (
        <div className="w-full h-screen relative">
          <div className="absolute top-[35%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
            <div className="flex flex-col items-center">
              <div className="opacity-90 hover:opacity-100 transition-opacity duration-300">
                <Image
                  src={wingsImage}
                  alt="ArkAngel Logo"
                  width={280}
                  height={180}
                  className="invert drop-shadow-lg"
                />
              </div>
            </div>
          </div>

          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
            <Interactive3DText mouse={mouse} />
          </div>

          <div className="absolute top-[65%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <WaitlistForm mouse={mouse} />
          </div>
        </div>
      )}
    </div>
  )
}
