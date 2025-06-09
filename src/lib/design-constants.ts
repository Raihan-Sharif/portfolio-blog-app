// Design constants for consistent gradients and colors
export const GRADIENTS = {
  primary: "bg-gradient-to-r from-primary via-purple-600 to-blue-600",
  primaryText:
    "bg-gradient-to-r from-primary via-purple-600 to-blue-600 bg-clip-text text-transparent",
  background: "bg-gradient-to-br from-background via-accent/30 to-background",
  card: "bg-gradient-to-br from-card/80 via-card to-card/90",
  skill: {
    expert: "from-purple-500 to-pink-500",
    advanced: "from-green-500 to-emerald-500",
    intermediate: "from-blue-500 to-cyan-500",
    beginner: "from-yellow-500 to-orange-500",
  },
} as const;

export const ANIMATIONS = {
  fadeIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  },
  staggerContainer: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { staggerChildren: 0.1 } },
  },
  staggerItem: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  },
} as const;

export const SPACING = {
  section: "py-20",
  container: "container mx-auto px-4",
  grid: {
    responsive: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8",
    skills:
      "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
  },
} as const;
