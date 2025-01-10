import { Link } from "react-router-dom";
import { Menu, LogOut } from "lucide-react";
import { menuItems } from "./menuItems";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

export const DesktopMenu = () => {
  // Split menu items into left and right sides
  const midPoint = Math.floor(menuItems.length / 2);
  const leftItems = menuItems.slice(0, midPoint);
  const rightItems = menuItems.slice(midPoint);

  return (
    <div className="relative inline-flex items-center w-full justify-center">
      <div className="group flex items-center h-12 hover:bg-black/30 backdrop-blur-sm rounded-lg transition-all duration-300">
        {/* Left side items - hidden by default */}
        <div className="flex items-center h-full overflow-hidden w-0 group-hover:w-auto transition-all duration-300">
          <div className="flex items-center gap-2 md:gap-4 h-full pl-2 md:pl-4 whitespace-nowrap">
            {leftItems.map((item) => (
              <Link
                key={item.title}
                to={item.href}
                className="flex items-center gap-1 md:gap-2 rounded-lg px-2 md:px-3 py-2 h-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                <item.icon className="h-4 w-4 md:h-5 md:w-5 text-theater-gold" />
                <span className="text-white text-sm md:text-base">{item.title}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Center hamburger icon - always visible */}
        <div className="px-4 md:px-6 bg-black/30 rounded-lg">
          <Menu className="h-4 w-4 md:h-5 md:w-5 text-theater-gold" />
        </div>

        {/* Right side items - hidden by default */}
        <div className="flex items-center h-full overflow-hidden w-0 group-hover:w-auto transition-all duration-300">
          <div className="flex items-center gap-2 md:gap-4 h-full pr-2 md:pr-4 whitespace-nowrap">
            {rightItems.map((item) => (
              <Link
                key={item.title}
                to={item.href}
                className="flex items-center gap-1 md:gap-2 rounded-lg px-2 md:px-3 py-2 h-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                <item.icon className="h-4 w-4 md:h-5 md:w-5 text-theater-gold" />
                <span className="text-white text-sm md:text-base">{item.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
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