import { motion } from "framer-motion";

interface DotMatrixProps {
  pattern: "header" | "balance" | "privacy" | "merkle" | "network";
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}

export default function DotMatrix({ 
  pattern, 
  size = "md", 
  animated = true 
}: DotMatrixProps) {
  const getDotCount = () => {
    switch (pattern) {
      case "header": return 3;
      case "balance": return 20;
      case "privacy": return 30;
      case "merkle": return 15;
      case "network": return 7;
      default: return 5;
    }
  };

  const getDotSize = () => {
    switch (size) {
      case "sm": return "w-1 h-1";
      case "md": return "w-2 h-2";
      case "lg": return "w-3 h-3";
    }
  };

  const renderHeaderDots = () => (
    <div className="flex space-x-1">
      {Array.from({ length: getDotCount() }).map((_, i) => (
        <motion.div
          key={i}
          className={`${getDotSize()} bg-white rounded-full`}
          animate={animated ? {
            opacity: [0.4, 1, 0.4],
            scale: [0.8, 1.2, 0.8]
          } : {}}
          transition={animated ? {
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.2
          } : {}}
        />
      ))}
    </div>
  );

  const renderBalanceDots = () => (
    <div className="grid grid-cols-20 gap-1 max-w-xs mx-auto breathing-dots">
      {Array.from({ length: getDotCount() }).map((_, i) => (
        <motion.div
          key={i}
          className={`${getDotSize()} bg-white rounded-full`}
          animate={animated ? {
            opacity: [0.6, 1, 0.6],
            scale: [1, 1.02, 1]
          } : {}}
          transition={animated ? {
            duration: 3,
            repeat: Infinity,
            delay: i * 0.1
          } : {}}
        />
      ))}
    </div>
  );

  const renderPrivacyDots = () => (
    <div className="flex space-x-1">
      {Array.from({ length: getDotCount() }).map((_, i) => {
        const isFilled = i < Math.floor(getDotCount() * 0.67); // 67% filled for demo
        return (
          <motion.div
            key={i}
            className={`${getDotSize()} rounded-full ${
              isFilled ? 'bg-white' : 'border border-white/30'
            }`}
            animate={animated && isFilled ? {
              opacity: [0.3, 1, 0.3]
            } : {}}
            transition={animated ? {
              duration: 2,
              repeat: Infinity,
              delay: i * 0.1
            } : {}}
          />
        );
      })}
    </div>
  );

  const renderMerkleDots = () => (
    <div className="flex flex-col items-center space-y-2">
      <motion.div 
        className={`${getDotSize()} bg-accent rounded-full`}
        animate={animated ? { scale: [1, 1.2, 1] } : {}}
        transition={animated ? { duration: 1.5, repeat: Infinity } : {}}
      />
      <div className="flex space-x-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <motion.div
            key={i}
            className={`${getDotSize()} bg-white/70 rounded-full`}
            animate={animated ? { opacity: [0.7, 1, 0.7] } : {}}
            transition={animated ? { 
              duration: 1.5, 
              repeat: Infinity, 
              delay: 0.5 + i * 0.2 
            } : {}}
          />
        ))}
      </div>
      <div className="flex space-x-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <motion.div
            key={i}
            className={`${getDotSize()} bg-white/50 rounded-full`}
            animate={animated ? { opacity: [0.5, 1, 0.5] } : {}}
            transition={animated ? { 
              duration: 1.5, 
              repeat: Infinity, 
              delay: 1 + i * 0.2 
            } : {}}
          />
        ))}
      </div>
    </div>
  );

  const renderNetworkDots = () => (
    <div className="grid grid-cols-7 gap-2 items-center justify-center">
      {Array.from({ length: getDotCount() * getDotCount() }).map((_, i) => {
        const row = Math.floor(i / getDotCount());
        const col = i % getDotCount();
        const isCenter = row === 3 && col === 3;
        const distance = Math.abs(row - 3) + Math.abs(col - 3);
        
        if (distance > 3) return <div key={i}></div>;
        
        return (
          <motion.div
            key={i}
            className={`${getDotSize()} rounded-full ${
              isCenter ? 'bg-accent' : distance === 1 ? 'bg-white/70' : 'bg-white/30'
            }`}
            animate={animated ? {
              opacity: [0.3, 1, 0.3],
              scale: [0.8, 1.2, 0.8]
            } : {}}
            transition={animated ? {
              duration: 1.5,
              repeat: Infinity,
              delay: distance * 0.5
            } : {}}
          />
        );
      })}
    </div>
  );

  switch (pattern) {
    case "header": return renderHeaderDots();
    case "balance": return renderBalanceDots();
    case "privacy": return renderPrivacyDots();
    case "merkle": return renderMerkleDots();
    case "network": return renderNetworkDots();
    default: return renderHeaderDots();
  }
}
