import { Link } from "react-router-dom";
import { Menu, LogOut } from "lucide-react";
import { menuItems } from "./menuItems";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export const DesktopMenu = () => {
  const { toast } = useToast();
  const [isHovered, setIsHovered] = useState(false);

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
    <div className="flex items-center gap-4">
      <div 
        className="relative group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Menu className="h-6 w-6 text-theater-gold hover:text-theater-purple transition-colors duration-300 relative z-10" />
        
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, width: 0 }}
              animate={{ opacity: 1, scale: 1, width: "600px" }}
              exit={{ opacity: 0, scale: 0.95, width: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-black/80 backdrop-blur-md rounded-lg border border-white/20 shadow-xl overflow-hidden"
            >
              <div className="grid grid-cols-3 gap-2 p-4 relative z-10">
                {menuItems.map((item) => (
                  <Link
                    key={item.title}
                    to={item.href}
                    className="relative overflow-hidden rounded-lg p-3 hover:bg-white/10 transition-colors group/item"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-start gap-3"
                    >
                      <item.icon className="h-5 w-5 text-theater-gold" />
                      <div>
                        <div className="font-medium text-white">{item.title}</div>
                        <p className="text-sm text-white/60">{item.description}</p>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Button
        variant="outline"
        onClick={handleLogout}
        className="text-white border-white/20 hover:text-theater-gold hover:bg-white/10 bg-black/30"
      >
        <LogOut className="h-4 w-4 mr-2" />
        Logout
      </Button>
    </div>
  );
};