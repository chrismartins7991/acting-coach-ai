import { Link } from "react-router-dom";
import { Menu, LogOut, Settings2 } from "lucide-react";
import { menuItems } from "./menuItems";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

export const DesktopMenu = () => {
  const midPoint = Math.floor(menuItems.length / 2);
  const leftItems = menuItems.slice(0, midPoint);
  const rightItems = menuItems.slice(midPoint);

  return (
    <div className="relative inline-flex items-center w-full justify-center">
      <div className="group flex items-center h-10 bg-white/10 hover:bg-white/15 backdrop-blur-lg border border-white/20 rounded-lg transition-all duration-300">
        {/* Left side items - hidden by default */}
        <div className="flex items-center h-full overflow-hidden w-0 group-hover:w-auto transition-all duration-300">
          <div className="flex items-center gap-1 md:gap-3 h-full pl-2 md:pl-3 whitespace-nowrap">
            {leftItems.map((item) => (
              <Link
                key={item.title}
                to={item.href}
                className="flex items-center gap-1 md:gap-2 rounded-lg px-2 md:px-2.5 py-1.5 h-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white/10"
              >
                <item.icon className="h-3.5 w-3.5 text-theater-gold/80" />
                <span className="text-white/70 text-xs md:text-sm font-medium">{item.title}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Center hamburger icon - always visible */}
        <div className="px-3 md:px-4 bg-white/5 backdrop-blur-md rounded-lg border-x border-white/10">
          <Menu className="h-3.5 w-3.5 text-theater-gold/80" />
        </div>

        {/* Right side items - hidden by default */}
        <div className="flex items-center h-full overflow-hidden w-0 group-hover:w-auto transition-all duration-300">
          <div className="flex items-center gap-1 md:gap-3 h-full pr-2 md:pr-3 whitespace-nowrap">
            {rightItems.map((item) => (
              <Link
                key={item.title}
                to={item.href}
                className="flex items-center gap-1 md:gap-2 rounded-lg px-2 md:px-2.5 py-1.5 h-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white/10"
              >
                <item.icon className="h-3.5 w-3.5 text-theater-gold/80" />
                <span className="text-white/70 text-xs md:text-sm font-medium">{item.title}</span>
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
      className="h-8 text-xs text-white/70 border-white/20 hover:text-theater-gold/80 hover:bg-white/10 bg-white/10 backdrop-blur-lg"
    >
      <LogOut className="h-3.5 w-3.5 mr-1.5" />
      Logout
    </Button>
  );
};

// Settings button component
DesktopMenu.Settings = function DesktopMenuSettings() {
  return (
    <Link to="/dashboard/settings">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 text-white/70 border-white/20 hover:text-theater-gold/80 hover:bg-white/10 bg-white/10 backdrop-blur-lg"
      >
        <Settings2 className="h-3.5 w-3.5" />
      </Button>
    </Link>
  );
};