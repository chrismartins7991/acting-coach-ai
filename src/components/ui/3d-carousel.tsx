"use client"

import { memo, useEffect, useLayoutEffect, useState } from "react"
import {
  AnimatePresence,
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
} from "framer-motion"

export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect

type UseMediaQueryOptions = {
  defaultValue?: boolean
  initializeWithValue?: boolean
}

const IS_SERVER = typeof window === "undefined"

export function useMediaQuery(
  query: string,
  {
    defaultValue = false,
    initializeWithValue = true,
  }: UseMediaQueryOptions = {}
): boolean {
  const getMatches = (query: string): boolean => {
    if (IS_SERVER) {
      return defaultValue
    }
    return window.matchMedia(query).matches
  }

  const [matches, setMatches] = useState<boolean>(() => {
    if (initializeWithValue) {
      return getMatches(query)
    }
    return defaultValue
  })

  const handleChange = () => {
    setMatches(getMatches(query))
  }

  useIsomorphicLayoutEffect(() => {
    const matchMedia = window.matchMedia(query)
    handleChange()

    matchMedia.addEventListener("change", handleChange)

    return () => {
      matchMedia.removeEventListener("change", handleChange)
    }
  }, [query])

  return matches
}

const duration = 0.15
const transition = { duration, ease: [0.32, 0.72, 0, 1] }
const transitionOverlay = { duration: 0.5, ease: [0.32, 0.72, 0, 1] }

const Carousel = memo(
  ({
    handleClick,
    controls,
    coaches,
    isCarouselActive,
  }: {
    handleClick: (coach: any, index: number) => void
    controls: any
    coaches: any[]
    isCarouselActive: boolean
  }) => {
    const isScreenXs = useMediaQuery("(max-width: 480px)")
    const isScreenSm = useMediaQuery("(max-width: 640px)")
    const isScreenMd = useMediaQuery("(max-width: 768px)")
    const isScreenLg = useMediaQuery("(max-width: 1024px)")

    // Adjust cylinder width based on screen size
    const getCylinderWidth = () => {
      if (isScreenXs) return 800
      if (isScreenSm) return 1000
      if (isScreenMd) return 1200
      if (isScreenLg) return 1500
      return 1800
    }

    const cylinderWidth = getCylinderWidth()
    const faceCount = coaches.length
    const faceWidth = cylinderWidth / faceCount
    const radius = cylinderWidth / (2 * Math.PI)
    const rotation = useMotionValue(0)
    const transform = useTransform(
      rotation,
      (value) => `rotate3d(0, 1, 0, ${value}deg)`
    )

    return (
      <div
        className="flex h-full items-center justify-center"
        style={{
          perspective: "1000px",
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
      >
        <motion.div
          drag={isCarouselActive ? "x" : false}
          className="relative flex h-full origin-center cursor-grab justify-center active:cursor-grabbing"
          style={{
            transform,
            rotateY: rotation,
            width: cylinderWidth,
            transformStyle: "preserve-3d",
          }}
          onDrag={(_, info) =>
            isCarouselActive &&
            rotation.set(rotation.get() + info.offset.x * 0.05)
          }
          onDragEnd={(_, info) =>
            isCarouselActive &&
            controls.start({
              rotateY: rotation.get() + info.velocity.x * 0.05,
              transition: {
                type: "spring",
                stiffness: 100,
                damping: 30,
                mass: 0.1,
              },
            })
          }
          animate={controls}
        >
          {coaches.map((coach, i) => (
            <motion.div
              key={`key-${coach.name}-${i}`}
              className="absolute flex h-full origin-center items-center justify-center rounded-xl bg-black/30 backdrop-blur-sm p-2"
              style={{
                width: `${faceWidth}px`,
                transform: `rotateY(${
                  i * (360 / faceCount)
                }deg) translateZ(${radius}px)`,
              }}
              onClick={() => handleClick(coach, i)}
            >
              <motion.div className="relative w-full h-full">
                <motion.img
                  src={coach.image}
                  alt={coach.name}
                  layoutId={`img-${coach.name}`}
                  className="pointer-events-none w-full h-full rounded-xl object-cover"
                  initial={{ filter: "blur(4px)" }}
                  layout="position"
                  animate={{ filter: "blur(0px)" }}
                  transition={transition}
                />
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
                  <h3 className="text-xl font-semibold text-white">{coach.name}</h3>
                  <p className="text-sm text-white/80">{coach.description}</p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    )
  }
)

export function ThreeDCoachCarousel({ coaches }: { coaches: any[] }) {
  const [activeCoach, setActiveCoach] = useState<any | null>(null)
  const [isCarouselActive, setIsCarouselActive] = useState(true)
  const controls = useAnimation()

  useEffect(() => {
    console.log("Coaches loaded:", coaches)
  }, [coaches])

  const handleClick = (coach: any) => {
    setActiveCoach(coach)
    setIsCarouselActive(false)
    controls.stop()
  }

  const handleClose = () => {
    setActiveCoach(null)
    setIsCarouselActive(true)
  }

  return (
    <motion.div layout className="relative">
      <AnimatePresence mode="sync">
        {activeCoach && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            layoutId={`img-container-${activeCoach.name}`}
            layout="position"
            onClick={handleClose}
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-8"
            style={{ willChange: "opacity" }}
            transition={transitionOverlay}
          >
            <motion.div className="max-w-2xl w-full bg-black/30 backdrop-blur-sm rounded-xl p-6">
              <motion.img
                layoutId={`img-${activeCoach.name}`}
                src={activeCoach.image}
                alt={activeCoach.name}
                className="w-full aspect-square object-cover rounded-lg shadow-lg mb-4"
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{
                  delay: 0.5,
                  duration: 0.5,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                style={{
                  willChange: "transform",
                }}
              />
              <h2 className="text-2xl font-bold text-white mb-2">{activeCoach.name}</h2>
              <p className="text-white/80 mb-2">{activeCoach.description}</p>
              <p className="text-theater-gold">{activeCoach.contribution}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="relative h-[600px] w-full overflow-hidden">
        <Carousel
          handleClick={handleClick}
          controls={controls}
          coaches={coaches}
          isCarouselActive={isCarouselActive}
        />
      </div>
    </motion.div>
  )
}

export { ThreeDCoachCarousel }
