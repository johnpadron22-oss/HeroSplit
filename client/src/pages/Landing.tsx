import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Zap, TrendingUp } from "lucide-react";
import { Link } from "wouter";

export default function Landing() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        staggerChildren: 0.1 
      } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[100px] rounded-full" />
      </div>

      <nav className="relative z-10 px-6 py-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="text-2xl font-display font-black tracking-tighter italic">
          <span className="text-hero">HERO</span>
          <span className="text-white">SPLIT</span>
        </div>
        <a href="/api/login">
          <Button variant="outline" className="rounded-full px-6 hover:bg-white/5">
            Login
          </Button>
        </a>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-32">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-3xl mx-auto"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-hero animate-pulse" />
            <span className="text-sm font-medium text-muted-foreground">The #1 Anime-Inspired Workout App</span>
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-display font-black tracking-tight leading-[1.1] mb-6">
            Train Like Your <br/>
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">Favorite Anime Hero.</span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
            From "100 Pushups" to "God Level" intensity. 
            Unlock themed workout plans, track your stats, and build your physique.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href="/api/login">
              <Button size="lg" className="h-14 px-8 rounded-full text-lg bg-white text-black hover:bg-gray-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                Start Training <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </a>
            <Button variant="ghost" className="h-14 px-8 rounded-full text-lg hover:bg-white/5">
              View Workouts
            </Button>
          </motion.div>
        </motion.div>

        {/* Feature Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="grid md:grid-cols-3 gap-6 mt-32"
        >
          {[
            { 
              icon: Shield, 
              title: "Hero Workouts", 
              desc: "Beginner to advanced calisthenics & weight training inspired by protagonists.",
              color: "text-cyan-400" 
            },
            { 
              icon: Zap, 
              title: "Villain Intensity", 
              desc: "Unlock Pro to access brutal, high-volume splits designed for pure power.",
              color: "text-purple-400" 
            },
            { 
              icon: TrendingUp, 
              title: "Stat Tracking", 
              desc: "Level up your profile with streaks, heatmaps, and achievement badges.",
              color: "text-yellow-400" 
            },
          ].map((item, i) => (
            <div key={i} className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors backdrop-blur-sm">
              <item.icon className={`w-10 h-10 ${item.color} mb-4`} />
              <h3 className="text-xl font-bold font-display mb-2">{item.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
