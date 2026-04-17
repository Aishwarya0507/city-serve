import * as React from "react";
import { motion } from "motion/react";
import { useNavigate, useLocation } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
  showBackButton?: boolean;
}

const pageVariants: any = {
  initial: {
    opacity: 0,
    y: 10,
    scale: 0.99,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.99,
    transition: {
      duration: 0.3,
      ease: "easeIn",
    },
  },
};

export function PageWrapper({ children, className, showBackButton = true }: PageWrapperProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show back button on landing page or root dashboards
  const isRoot = location.pathname === "/" || 
                 location.pathname === "/customer" || 
                 location.pathname === "/provider" || 
                 location.pathname === "/admin";

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      className={`${className} relative`}
    >
      {showBackButton && !isRoot && (
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="fixed top-24 left-8 z-[100] hidden lg:block"
        >
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            className="size-16 rounded-[1.5rem] bg-indigo-600/10 text-indigo-400 hover:bg-white hover:text-black transition-all duration-700 shadow-2xl border border-white/5 backdrop-blur-xl group"
          >
            <ArrowLeft className="size-6 group-hover:-translate-x-2 transition-transform" />
          </Button>
        </motion.div>
      )}

      {/* Mobile Back Button */}
      {showBackButton && !isRoot && (
        <div className="lg:hidden px-6 pt-4">
           <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            className="h-12 px-5 rounded-xl bg-white/5 text-slate-400 font-black uppercase tracking-widest text-[10px] border border-white/5"
          >
            <ArrowLeft className="size-4 mr-2" /> Back
          </Button>
        </div>
      )}

      {children}
    </motion.div>
  );
}
