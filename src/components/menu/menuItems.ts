import { Camera, FileVideo, History, Home, User, MessageSquare } from "lucide-react";

export const menuItems = [
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
];