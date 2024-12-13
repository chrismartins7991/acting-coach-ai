import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { Camera, FileVideo, History, Home, User, Settings } from "lucide-react";
import { Link } from "react-router-dom";

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
    href: "/dashboard/history",
    icon: History,
    description: "View your past performances and feedback",
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

export const TopMenu = () => {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
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
    </div>
  );
};