
import { useState, useEffect } from "react";
import { TopMenu } from "@/components/TopMenu";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext
} from "@/components/ui/carousel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileNavBar } from "@/components/dashboard/MobileNavBar";
import { ActivityList } from "@/components/profile/ActivityList";
import { StatsSection } from "@/components/dashboard/StatsSection";

// Mock data for actor friends
const actorFriends = [
  { id: 1, name: "Emma Stone", avatar: "https://etqdfxnyvrjyabjduhpk.supabase.co/storage/v1/object/public/images/emma-stone.jpg" },
  { id: 2, name: "Tom Hanks", avatar: "https://etqdfxnyvrjyabjduhpk.supabase.co/storage/v1/object/public/images/tom-hanks.jpg" },
  { id: 3, name: "Meryl Streep", avatar: "https://etqdfxnyvrjyabjduhpk.supabase.co/storage/v1/object/public/images/meryl-streep.jpg" },
  { id: 4, name: "Denzel Washington", avatar: "https://etqdfxnyvrjyabjduhpk.supabase.co/storage/v1/object/public/images/denzel-washington.jpg" },
  { id: 5, name: "Viola Davis", avatar: "https://etqdfxnyvrjyabjduhpk.supabase.co/storage/v1/object/public/images/viola-davis.jpg" },
  { id: 6, name: "Leonardo DiCaprio", avatar: "https://etqdfxnyvrjyabjduhpk.supabase.co/storage/v1/object/public/images/leonardo-dicaprio.jpg" },
];

// Fixed type definitions in the mock data for recent activities
const recentActivities = [
  {
    id: 1,
    title: "Hamlet Monologue",
    type: "selftape" as const,  // Using 'as const' to ensure TypeScript recognizes this as a literal type
    date: "May 7, 2025",
    score: 82,
    image: "https://etqdfxnyvrjyabjduhpk.supabase.co/storage/v1/object/public/lovable-uploads/iconic-movie-frames/Joker-Pin.jpeg"
  },
  {
    id: 2,
    title: "Line Memorization Practice",
    type: "rehearsal" as const,
    subtype: "memorization" as const,
    date: "May 5, 2025",
    duration: "45 min",
    image: "https://etqdfxnyvrjyabjduhpk.supabase.co/storage/v1/object/public/lovable-uploads/iconic-movie-frames/There_Will_Be_Blood_Daniel_Day_Lewis.jpeg"
  },
  {
    id: 3,
    title: "AI Reader Practice",
    type: "rehearsal" as const,
    subtype: "aireader" as const,
    date: "May 3, 2025",
    duration: "30 min",
    image: "https://etqdfxnyvrjyabjduhpk.supabase.co/storage/v1/object/public/lovable-uploads/iconic-movie-frames/Emma-Stone-The-Favourite.jpeg"
  },
  {
    id: 4,
    title: "Film Scene",
    type: "selftape" as const,
    date: "May 1, 2025",
    score: 88,
    image: "https://etqdfxnyvrjyabjduhpk.supabase.co/storage/v1/object/public/lovable-uploads/iconic-movie-frames/Taxi_Driver_Robert_Deniro.jpeg"
  },
  {
    id: 5,
    title: "Cold Reading Practice",
    type: "rehearsal" as const,
    subtype: "coldreading" as const,
    date: "Apr 29, 2025",
    duration: "25 min",
    image: "https://etqdfxnyvrjyabjduhpk.supabase.co/storage/v1/object/public/lovable-uploads/iconic-movie-frames/Oscars-Glamour-Golden-Age.jpeg"
  }
];

const ProfilePage = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const userEmail = user?.email || "User";
  const userName = user?.user_metadata?.full_name || userEmail.split("@")[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-theater-purple via-black to-theater-red text-white overflow-x-hidden">
      <TopMenu />
      
      {/* Added fixed positioning for mobile settings button */}
      {isMobile && (
        <div className="fixed top-4 right-4 z-50">
          <Link to="/profile-settings">
            <Button variant="outline" size="icon" className="h-8 w-8 bg-neutral-900/80 border-neutral-700">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}
      
      <div className={`container mx-auto px-4 py-8 ${isMobile ? 'pt-20' : 'pt-36'} pb-28 max-w-4xl`}>
        {/* Profile header */}
        <div className="flex items-center mb-8">
          <div className="flex items-center">
            <Avatar className="h-16 w-16 border-2 border-theater-gold mr-4">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-neutral-800 text-white text-xl">
                {userName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{userName}</h1>
              <p className="text-sm text-neutral-400">{userEmail}</p>
            </div>
          </div>
          
          {/* Only show button on desktop */}
          {!isMobile && (
            <div className="ml-auto">
              <Link to="/profile-settings">
                <Button variant="outline" className="bg-neutral-900 border-neutral-700">
                  <Settings className="h-4 w-4" />
                  <span className="ml-2">Profile Settings</span>
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Stats Section */}
        <div className="mb-8">
          <StatsSection />
        </div>
        
        {/* Actor Friends Carousel */}
        <div className="mb-8">
          <h2 className="text-lg md:text-xl font-bold mb-4">Actor Friends</h2>
          <Carousel
            opts={{
              align: "start",
              loop: true
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {actorFriends.map((friend) => (
                <CarouselItem key={friend.id} className="pl-4 md:basis-1/4 lg:basis-1/6">
                  <div className="flex flex-col items-center">
                    <Avatar className="h-16 w-16 md:h-20 md:w-20 border-2 border-theater-gold mb-2">
                      <AvatarImage src={friend.avatar} alt={friend.name} />
                      <AvatarFallback className="bg-neutral-800 text-white">
                        {friend.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-xs md:text-sm text-center">{friend.name}</p>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-0 bg-black/50 border-theater-gold/50 text-white" />
            <CarouselNext className="right-0 bg-black/50 border-theater-gold/50 text-white" />
          </Carousel>
        </div>
        
        {/* Activities Feed - Replacing Performances Feed */}
        <ActivityList activities={recentActivities} />
      </div>
      
      {/* Use the MobileNavBar component for mobile navigation instead of custom implementation */}
      {isMobile && <MobileNavBar />}
    </div>
  );
};

export default ProfilePage;
