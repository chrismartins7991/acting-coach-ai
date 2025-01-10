import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { Camera, FileVideo, History, Home, Menu, User, Settings, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

const MobileMenu = () => (
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
    </DropdownMenuContent>
  </DropdownMenu>
);

const DesktopMenu = () => (
  <NavigationMenu className="relative mx-auto bg-background/80 backdrop-blur-md rounded-lg shadow-lg border border-theater-purple/20">
    <NavigationMenuList className="px-4 py-2">
      {menuItems.map((item) => (
        <NavigationMenuItem key={item.title}>
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
);

export const TopMenu = () => {
  const isMobile = useIsMobile();

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] sm:w-auto">
      {isMobile ? <MobileMenu /> : <DesktopMenu />}
    </div>
  );
};