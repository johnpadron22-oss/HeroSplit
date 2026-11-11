import { motion } from "framer-motion";
import { X } from "lucide-react";

interface Props {
  message: string;
  onDismiss: () => void;
}

export function WalkthroughTip({ message, onDismiss }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
      className="relative mb-2 mx-1"
    >
      <div className="flex items-center gap-2.5 bg-cyan-950 border border-cyan-500/40 rounded-xl px-4 py-3 text-sm text-cyan-100 shadow-lg shadow-black/30">
        <span className="flex-1 leading-snug">{message}</span>
        <button
          onClick={onDismiss}
          className="shrink-0 text-cyan-400/70 hover:text-cyan-200 transition-colors"
          aria-label="Dismiss tip"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      {/* Arrow pointing down toward the button below */}
      <svg
        className="absolute left-6 -bottom-2.5 text-cyan-950"
        width="12"
        height="10"
        viewBox="0 0 12 10"
        aria-hidden="true"
      >
        <polygon
          points="0,0 12,0 6,10"
          fill="currentColor"
          stroke="rgb(8 145 178 / 0.4)"
          strokeWidth="1"
          strokeLinejoin="round"
        />
      </svg>
    </motion.div>
  );
}
