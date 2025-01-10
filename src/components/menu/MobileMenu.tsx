import { Link } from "react-router-dom";
import { Menu, LogOut } from "lucide-react";
import { menuItems } from "./menuItems";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const MobileMenu = () => {
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
    <DropdownMenu>
      <DropdownMenuTrigger className="relative flex items-center gap-2 rounded-lg bg-background/80 backdrop-blur-md px-4 py-2 text-theater-purple hover:text-theater-gold hover:bg-theater-purple/10 transition-all duration-300 ease-in-out transform hover:scale-105">
        <Menu className="h-5 w-5" />
        <span>Menu</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 bg-background/95 backdrop-blur-md">
        {menuItems.map((item) => (
          <DropdownMenuItem key={item.title} asChild>
            <Link
              to={item.href}
              className="flex items-center gap-2 p-2 hover:bg-theater-purple/10 hover:text-theater-gold"
            >
              <item.icon className="h-4 w-4" />
              <div>
                <div className="font-medium">{item.title}</div>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem 
          onClick={handleLogout}
          className="flex items-center gap-2 p-2 hover:bg-theater-purple/10 hover:text-theater-gold text-theater-red"
        >
          <LogOut className="h-4 w-4" />
          <div>
            <div className="font-medium">Logout</div>
            <p className="text-xs text-muted-foreground">Sign out of your account</p>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};