import { Link } from "react-router-dom";
import { Menu, LogOut } from "lucide-react";
import { menuItems } from "./menuItems";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export const DesktopMenu = () => {
  const [isHovered, setIsHovered] = useState(false);

  // Split menu items into left and right sides
  const midPoint = Math.floor(menuItems.length / 2);
  const leftItems = menuItems.slice(0, midPoint);
  const rightItems = menuItems.slice(midPoint);

  return (
    <div 
      className="relative inline-flex items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Menu className="h-6 w-6 text-theater-gold hover:text-theater-purple transition-colors duration-300" />
      
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0, scaleX: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute top-0 left-1/2 -translate-x-1/2 h-full"
            style={{ transformOrigin: "center" }}
          >
            <div className="flex items-center h-full bg-black/30 backdrop-blur-sm rounded-lg px-4">
              {/* Left side items */}
              <div className="flex items-center gap-6 h-full">
                {leftItems.map((item) => (
                  <Link
                    key={item.title}
                    to={item.href}
                    className="flex items-center gap-2 rounded-lg hover:bg-black/30 transition-colors px-3 py-2 whitespace-nowrap h-full"
                  >
                    <item.icon className="h-5 w-5 text-theater-gold" />
                    <span className="text-white">{item.title}</span>
                  </Link>
                ))}
              </div>

              {/* Center divider */}
              <div className="w-6" />

              {/* Right side items */}
              <div className="flex items-center gap-6 h-full">
                {rightItems.map((item) => (
                  <Link
                    key={item.title}
                    to={item.href}
                    className="flex items-center gap-2 rounded-lg hover:bg-black/30 transition-colors px-3 py-2 whitespace-nowrap h-full"
                  >
                    <item.icon className="h-5 w-5 text-theater-gold" />
                    <span className="text-white">{item.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Separate logout component for top-right positioning
DesktopMenu.Logout = function DesktopMenuLogout() {
  const { toast } = useToast();
  
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out successfully",
        description: "Come back soon!",
      });
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        title: "Error logging out",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleLogout}
      className="text-white border-white/20 hover:text-theater-gold hover:bg-white/10 bg-black/30 backdrop-blur-md"
    >
      <LogOut className="h-4 w-4 mr-2" />
      Logout
    </Button>
  );
};