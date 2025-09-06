import { Button } from "@/components/ui/button";
import DotMatrix from "@/components/dot-matrix";
import { motion } from "framer-motion";

interface WelcomeScreenProps {
  onGetStarted: () => void;
  onSkip: () => void;
}

export default function WelcomeScreen({ onGetStarted, onSkip }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <motion.div 
        className="max-w-md w-full text-center space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Header with App Title */}
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          <div className="flex items-center justify-center space-x-2 breathing-dots">
            <DotMatrix pattern="header" />
            <h1 className="text-3xl font-mono font-bold tracking-wider" data-testid="text-app-title">
              zkETHer
            </h1>
            <DotMatrix pattern="header" />
          </div>
          <p className="text-lg text-muted-foreground font-medium">
            Private ETH Transfers
          </p>
        </motion.div>

        {/* Feature Showcase */}
        <motion.div 
          className="bg-card border border-border rounded-lg p-6 space-y-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="mb-4">
            <DotMatrix pattern="balance" />
          </div>
          
          <div className="space-y-3 text-left">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-accent rounded-full pulse-dot"></div>
              <span className="text-sm text-muted-foreground">Send ETH Unlinkably</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-accent rounded-full pulse-dot"></div>
              <span className="text-sm text-muted-foreground">Break Transaction Links</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-accent rounded-full pulse-dot"></div>
              <span className="text-sm text-muted-foreground">Protect Your Privacy</span>
            </div>
          </div>
        </motion.div>

        {/* Get Started Button */}
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <Button 
            onClick={onGetStarted}
            className="w-full font-mono py-6 text-lg"
            data-testid="button-get-started"
          >
            <div className="flex items-center space-x-2">
              <DotMatrix pattern="header" size="sm" />
              <span>GET STARTED</span>
              <DotMatrix pattern="header" size="sm" />
            </div>
          </Button>
          
          <div className="flex space-x-4">
            <Button 
              variant="secondary" 
              className="flex-1 font-mono"
              data-testid="button-learn-more"
            >
              Learn More
            </Button>
            <Button 
              variant="ghost" 
              className="flex-1 font-mono"
              onClick={onSkip}
              data-testid="button-skip"
            >
              Skip
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}