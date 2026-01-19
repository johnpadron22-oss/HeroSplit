"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import type {
  UserProgress,
  WorkoutSession,
  Achievement,
} from "@/lib/types"
import { DEFAULT_ACHIEVEMENTS } from "@/lib/types"

const STORAGE_KEY = "herosplit-progress"

interface ProgressContextType {
  progress: UserProgress
  isLoading: boolean
  // Favorites
  toggleFavorite: (slug: string) => void
  isFavorite: (slug: string) => boolean
  // Workout Sessions
  startWorkout: (session: Omit<WorkoutSession, "id" | "completedAt" | "completedExercises" | "duration">) => string
  completeWorkout: (sessionId: string, completedExercises: WorkoutSession["completedExercises"], duration: number) => void
  // Progress
  getWorkoutsForDate: (date: string) => WorkoutSession[]
  getRecentWorkouts: (limit?: number) => WorkoutSession[]
  // Achievements
  checkAndUnlockAchievements: () => Achievement[]
}

const defaultProgress: UserProgress = {
  totalWorkouts: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastWorkoutDate: null,
  workoutHistory: [],
  achievements: DEFAULT_ACHIEVEMENTS.map((a) => ({
    ...a,
    unlockedAt: null,
    progress: 0,
  })),
  favorites: [],
}

const ProgressContext = createContext<ProgressContextType | null>(null)

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<UserProgress>(defaultProgress)
  const [isLoading, setIsLoading] = useState(true)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as UserProgress
        // Merge with default achievements to ensure new ones are included
        const mergedAchievements = DEFAULT_ACHIEVEMENTS.map((defaultAch) => {
          const existing = parsed.achievements?.find((a) => a.id === defaultAch.id)
          return existing || { ...defaultAch, unlockedAt: null, progress: 0 }
        })
        setProgress({
          ...defaultProgress,
          ...parsed,
          achievements: mergedAchievements,
        })
      }
    } catch (e) {
      console.error("Failed to load progress from localStorage:", e)
    }
    setIsLoading(false)
  }, [])

  // Save to localStorage when progress changes
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
      } catch (e) {
        console.error("Failed to save progress to localStorage:", e)
      }
    }
  }, [progress, isLoading])

  const toggleFavorite = useCallback((slug: string) => {
    setProgress((prev) => {
      const isFav = prev.favorites.includes(slug)
      return {
        ...prev,
        favorites: isFav
          ? prev.favorites.filter((s) => s !== slug)
          : [...prev.favorites, slug],
      }
    })
  }, [])

  const isFavorite = useCallback(
    (slug: string) => progress.favorites.includes(slug),
    [progress.favorites]
  )

  const startWorkout = useCallback(
    (session: Omit<WorkoutSession, "id" | "completedAt" | "completedExercises" | "duration">) => {
      const id = `workout-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      return id
    },
    []
  )

  const calculateStreak = useCallback((history: WorkoutSession[], newDate: string): { current: number; longest: number } => {
    const dates = [...new Set(history.map((w) => w.date))].sort().reverse()
    
    // Add new date if not already present
    if (!dates.includes(newDate)) {
      dates.unshift(newDate)
      dates.sort().reverse()
    }

    let currentStreak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    for (let i = 0; i < dates.length; i++) {
      const workoutDate = new Date(dates[i])
      workoutDate.setHours(0, 0, 0, 0)
      
      const expectedDate = new Date(today)
      expectedDate.setDate(expectedDate.getDate() - i)
      
      // Check if this date matches expected streak date (today, yesterday, etc.)
      if (workoutDate.getTime() === expectedDate.getTime()) {
        currentStreak++
      } else if (i === 0 && workoutDate.getTime() === new Date(today.getTime() - 86400000).getTime()) {
        // Allow for yesterday if today hasn't been done yet
        currentStreak++
      } else {
        break
      }
    }

    // Calculate longest streak
    let longestStreak = currentStreak
    let tempStreak = 1
    
    for (let i = 1; i < dates.length; i++) {
      const prevDate = new Date(dates[i - 1])
      const currDate = new Date(dates[i])
      const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / 86400000)
      
      if (diffDays === 1) {
        tempStreak++
        longestStreak = Math.max(longestStreak, tempStreak)
      } else {
        tempStreak = 1
      }
    }

    return { current: currentStreak, longest: Math.max(longestStreak, currentStreak) }
  }, [])

  const completeWorkout = useCallback(
    (
      sessionId: string,
      completedExercises: WorkoutSession["completedExercises"],
      duration: number
    ) => {
      setProgress((prev) => {
        const newSession: WorkoutSession = {
          id: sessionId,
          date: new Date().toISOString().split("T")[0],
          characterId: "",
          characterSlug: "",
          characterName: "",
          characterAvatar: "",
          dayIndex: 0,
          dayFocus: "Mixed",
          completedExercises,
          duration,
          completedAt: new Date().toISOString(),
        }

        // This will be filled in by the workout mode component
        const newHistory = [...prev.workoutHistory, newSession]
        const { current, longest } = calculateStreak(newHistory, newSession.date)

        return {
          ...prev,
          totalWorkouts: prev.totalWorkouts + 1,
          currentStreak: current,
          longestStreak: Math.max(longest, prev.longestStreak),
          lastWorkoutDate: newSession.date,
          workoutHistory: newHistory,
        }
      })
    },
    [calculateStreak]
  )

  const saveCompletedWorkout = useCallback(
    (session: WorkoutSession) => {
      setProgress((prev) => {
        const newHistory = [...prev.workoutHistory, session]
        const { current, longest } = calculateStreak(newHistory, session.date)

        return {
          ...prev,
          totalWorkouts: prev.totalWorkouts + 1,
          currentStreak: current,
          longestStreak: Math.max(longest, prev.longestStreak),
          lastWorkoutDate: session.date,
          workoutHistory: newHistory,
        }
      })
    },
    [calculateStreak]
  )

  const getWorkoutsForDate = useCallback(
    (date: string) => progress.workoutHistory.filter((w) => w.date === date),
    [progress.workoutHistory]
  )

  const getRecentWorkouts = useCallback(
    (limit = 10) => [...progress.workoutHistory].reverse().slice(0, limit),
    [progress.workoutHistory]
  )

  const checkAndUnlockAchievements = useCallback(() => {
    const newlyUnlocked: Achievement[] = []

    setProgress((prev) => {
      const updatedAchievements = prev.achievements.map((ach) => {
        if (ach.unlockedAt) return ach

        let newProgress = ach.progress

        switch (ach.id) {
          case "first-workout":
            newProgress = prev.totalWorkouts
            break
          case "streak-3":
          case "streak-7":
          case "streak-30":
            newProgress = prev.currentStreak
            break
          case "workouts-10":
          case "workouts-50":
          case "workouts-100":
            newProgress = prev.totalWorkouts
            break
        }

        if (newProgress >= ach.requirement && !ach.unlockedAt) {
          const unlocked = {
            ...ach,
            progress: newProgress,
            unlockedAt: new Date().toISOString(),
          }
          newlyUnlocked.push(unlocked)
          return unlocked
        }

        return { ...ach, progress: newProgress }
      })

      return { ...prev, achievements: updatedAchievements }
    })

    return newlyUnlocked
  }, [])

  return (
    <ProgressContext.Provider
      value={{
        progress,
        isLoading,
        toggleFavorite,
        isFavorite,
        startWorkout,
        completeWorkout,
        getWorkoutsForDate,
        getRecentWorkouts,
        checkAndUnlockAchievements,
      }}
    >
      {children}
    </ProgressContext.Provider>
  )
}

export function useProgress() {
  const context = useContext(ProgressContext)
  if (!context) {
    throw new Error("useProgress must be used within ProgressProvider")
  }
  return context
}

// Export a function to save completed workouts directly
export function useSaveWorkout() {
  const context = useContext(ProgressContext)
  if (!context) {
    throw new Error("useSaveWorkout must be used within ProgressProvider")
  }

  return useCallback(
    (session: WorkoutSession) => {
      // We need to update progress directly
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as UserProgress
        const newHistory = [...parsed.workoutHistory, session]
        
        // Calculate streak
        const dates = [...new Set(newHistory.map((w) => w.date))].sort().reverse()
        let currentStreak = 0
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        for (let i = 0; i < dates.length; i++) {
          const workoutDate = new Date(dates[i])
          workoutDate.setHours(0, 0, 0, 0)
          const expectedDate = new Date(today)
          expectedDate.setDate(expectedDate.getDate() - i)
          
          if (workoutDate.getTime() === expectedDate.getTime()) {
            currentStreak++
          } else {
            break
          }
        }

        const updated: UserProgress = {
          ...parsed,
          totalWorkouts: parsed.totalWorkouts + 1,
          currentStreak,
          longestStreak: Math.max(currentStreak, parsed.longestStreak),
          lastWorkoutDate: session.date,
          workoutHistory: newHistory,
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
        
        // Force a re-render by triggering storage event
        window.dispatchEvent(new Event("storage"))
      }
    },
    []
  )
}
