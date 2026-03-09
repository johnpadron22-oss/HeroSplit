"use client"

import { useState } from "react"
import { BuildTab } from "@/components/build-tab"
import { VillainsTab } from "@/components/villains-tab"
import { BrowseTab } from "@/components/browse-tab"
import { ProgressTab } from "@/components/progress-tab"
import { Paywall } from "@/components/paywall"
import { useAuth } from "@/lib/auth/auth-provider"
import { useProgress } from "@/lib/progress/progress-context"
import { useRouter } from "next/navigation"
import { Flame } from "lucide-react"

type Tab = "Browse" | "Build" | "Villains" | "Progress"

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<Tab>("Browse")
  const [showPaywall, setShowPaywall] = useState(false)
  const router = useRouter()

  const { user, isPro, loading, signOut, refreshProfile } = useAuth()
  const { progress } = useProgress()

  const handleLogout = async () => {
    await signOut()
    router.refresh()
  }

  const handleSubscribe = async (plan: "monthly" | "annual") => {
    console.log("Subscribe to:", plan)
    // In production, trigger actual purchase flow
    // For now, simulate upgrade
    setShowPaywall(false)
    await refreshProfile()
  }

  const handleRestore = async () => {
    console.log("Restore purchases")
    // In production, check for existing purchases
    await refreshProfile()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent flex items-center gap-2">
                <span className="text-3xl md:text-4xl">&#9889;</span>
                HeroSplit
              </h1>
              <span className="px-2 py-1 text-xs font-bold rounded bg-primary/20 text-primary border border-primary/30">
                MVP
              </span>
            </div>
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <span className="text-sm text-muted-foreground hidden md:inline">
                    {user.user_metadata?.display_name || user.email}
                  </span>
                  {!isPro && (
                    <button
                      onClick={() => setShowPaywall(true)}
                      className="px-4 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black font-semibold text-sm hover:opacity-90 transition-opacity"
                    >
                      Get Pro
                    </button>
                  )}
                  {isPro && (
                    <span className="px-3 py-1.5 rounded-full bg-primary/20 text-primary text-xs font-bold border border-primary/30">
                      PRO
                    </span>
                  )}
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-xl bg-secondary/50 hover:bg-secondary text-foreground font-medium text-sm transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleRestore}
                    className="px-4 py-2 rounded-xl bg-secondary/30 hover:bg-secondary/50 text-muted-foreground font-medium text-sm transition-colors"
                  >
                    Restore
                  </button>
                  <button
                    onClick={() => router.push("/auth/login")}
                    className="px-4 py-2 rounded-xl bg-secondary/50 hover:bg-secondary text-foreground font-medium text-sm transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => router.push("/auth/sign-up")}
                    className="px-4 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black font-semibold text-sm hover:opacity-90 transition-opacity"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("Browse")}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === "Browse"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/30 hover:bg-secondary/50 text-foreground"
              }`}
            >
              Browse
            </button>
            <button
              onClick={() => setActiveTab("Build")}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === "Build"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/30 hover:bg-secondary/50 text-foreground"
              }`}
            >
              Build
            </button>
            <button
              onClick={() => setActiveTab("Villains")}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === "Villains"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/30 hover:bg-secondary/50 text-foreground"
              }`}
            >
              Villains
            </button>
            <button
              onClick={() => setActiveTab("Progress")}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
                activeTab === "Progress"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/30 hover:bg-secondary/50 text-foreground"
              }`}
            >
              Progress
              {progress.currentStreak > 0 && (
                <span className="flex items-center gap-1 text-xs bg-orange-500/20 text-orange-500 px-1.5 py-0.5 rounded-full">
                  <Flame className="h-3 w-3" />
                  {progress.currentStreak}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {activeTab === "Browse" && <BrowseTab onShowPaywall={() => setShowPaywall(true)} />}
        {activeTab === "Build" && <BuildTab onShowPaywall={() => setShowPaywall(true)} />}
        {activeTab === "Villains" && <VillainsTab onShowPaywall={() => setShowPaywall(true)} />}
        {activeTab === "Progress" && <ProgressTab />}
      </main>

      {/* Footer Disclaimer */}
      <footer className="border-t border-border mt-20">
        <div className="container mx-auto px-4 py-8">
          <p className="text-sm text-muted-foreground text-center leading-relaxed mb-4">
            <strong>Disclaimer:</strong> All training plans are inspiration-based templates derived from publicly
            available information about fictional characters and public figures. No endorsement implied. These programs
            are for educational and entertainment purposes only. Always consult with a qualified healthcare or fitness
            professional before beginning any exercise program.
          </p>
          <p className="text-xs text-muted-foreground/60 text-center">
            &copy; 2025 HeroSplit. Train like your favorite icons.
          </p>
        </div>
      </footer>

      {showPaywall && (
        <Paywall onClose={() => setShowPaywall(false)} onSubscribe={handleSubscribe} onRestore={handleRestore} />
      )}
    </div>
  )
}
