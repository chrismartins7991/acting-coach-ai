import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { Camera, FileVideo, History, Home, Menu, User, Settings, MessageSquare, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "./ui/use-toast";
import { useCallback } from "react";
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Container, Engine } from "@tsparticles/engine";

const menuItems = [
  {
    title: "Home",
    href: "/dashboard",
    icon: Home,
    description: "Return to your dashboard overview",
  },
  {
    title: "Record",
    href: "/dashboard/record",
    icon: Camera,
    description: "Record a new performance for feedback",
  },
  {
    title: "Library",
    href: "/dashboard/library",
    icon: FileVideo,
    description: "Access your video library and uploads",
  },
  {
    title: "History",
    href: "/history",
    icon: History,
    description: "View your past performances and feedback",
  },
  {
    title: "Chat",
    href: "/chat",
    icon: MessageSquare,
    description: "Chat with your AI acting coach",
  },
  {
    title: "Profile",
    href: "/dashboard/profile",
    icon: User,
    description: "Manage your profile and preferences",
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    description: "Configure your account settings",
  },
];

const ListItem = ({ className, title, href, children, icon: Icon }: any) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          to={href}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-theater-purple/10 hover:text-theater-gold focus:bg-theater-purple/10 focus:text-theater-gold",
            className
          )}
        >
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            <div className="text-sm font-medium leading-none">{title}</div>
          </div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
};

const MobileMenu = () => {
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
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg bg-background/80 px-4 py-2 text-theater-purple hover:text-theater-gold hover:bg-theater-purple/10">
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

const DesktopMenu = () => {
  const { toast } = useToast();
  
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

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
    <div className="flex items-center gap-4 group relative">
      <div className="absolute inset-0 w-screen h-screen pointer-events-none group-hover:pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <Particles
          id="tsparticles"
          init={particlesInit}
          options={{
            particles: {
              color: {
                value: "#FFD700",
              },
              number: {
                density: {
                  enable: true,
                  area: 800,
                },
                value: 30,
              },
              opacity: {
                value: { min: 0.1, max: 0.5 },
              },
              shape: {
                type: "circle",
              },
              size: {
                value: { min: 1, max: 3 },
              },
              move: {
                enable: true,
                direction: "none",
                speed: 2,
                random: true,
                straight: false,
                outModes: {
                  default: "out",
                },
              },
            },
            detectRetina: true,
            fpsLimit: 60,
            fullScreen: {
              enable: false,
              zIndex: 1,
            },
            background: {
              color: {
                value: "transparent",
              },
            },
          }}
        />
      </div>
      <div className="relative flex items-center justify-center">
        <Menu className="h-6 w-6 text-theater-gold hover:text-theater-purple transition-colors duration-300 z-20" />
        <NavigationMenu className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background/40 backdrop-blur-md rounded-lg shadow-lg border border-theater-purple/20 transition-all duration-700 ease-in-out w-0 group-hover:w-[600px] overflow-hidden opacity-0 group-hover:opacity-100 invisible group-hover:visible">
          <NavigationMenuList className="px-4 py-2 flex justify-center">
            {menuItems.map((item) => (
              <NavigationMenuItem 
                key={item.title} 
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100"
              >
                <NavigationMenuTrigger 
                  className="h-9 text-theater-purple hover:text-theater-gold hover:bg-theater-purple/10 data-[state=open]:bg-theater-purple/10 data-[state=open]:text-theater-gold"
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.title}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 bg-background/95 backdrop-blur-md rounded-lg shadow-lg">
                    <ListItem
                      key={item.title}
                      title={item.title}
                      href={item.href}
                      icon={item.icon}
                    >
                      {item.description}
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      <Button
        variant="outline"
        onClick={handleLogout}
        className="text-white border-white/20 hover:text-theater-gold hover:bg-white/10 bg-black/30 z-20"
      >
        <LogOut className="h-4 w-4 mr-2" />
        Logout
      </Button>
    </div>
  );
};

export const TopMenu = () => {
  const isMobile = useIsMobile();

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] sm:w-auto">
      {isMobile ? <MobileMenu /> : <DesktopMenu />}
    </div>
  );
};