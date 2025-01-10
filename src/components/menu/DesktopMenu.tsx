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

  return (
    <div 
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Menu className="h-6 w-6 text-theater-gold hover:text-theater-purple transition-colors duration-300 relative z-10" />
      
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0, scaleX: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-black/80 backdrop-blur-md rounded-lg border border-white/20 shadow-xl overflow-hidden"
            style={{ transformOrigin: "center" }}
          >
            <div className="flex items-center gap-2 p-2 whitespace-nowrap">
              {menuItems.map((item) => (
                <Link
                  key={item.title}
                  to={item.href}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <item.icon className="h-5 w-5 text-theater-gold" />
                  <span className="text-white">{item.title}</span>
                </Link>
              ))}
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