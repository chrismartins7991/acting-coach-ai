
import { useState, useEffect } from "react";
import { TopMenu } from "@/components/TopMenu";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, ChevronRight, LogOut, Settings, LayoutDashboard, Activity, MessageSquare as Award, User } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

const ProfilePage = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { usage, plan, isLoading } = useSubscription();
  const { toast } = useToast();
  const [performanceCount, setPerformanceCount] = useState(24);
  const [averageScore, setAverageScore] = useState(68);

  const userEmail = user?.email || "User";
  const userName = user?.user_metadata?.full_name || userEmail.split("@")[0];
  
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

  const subscriptionRenewalDate = usage?.subscription_expiry 
    ? format(new Date(usage.subscription_expiry), "MMMM d, yyyy")
    : "May 15, 2025";

  return (
    <div className="min-h-screen bg-gradient-to-br from-theater-purple via-black to-theater-red text-white">
      <TopMenu />
      
      <div className={`container mx-auto px-4 py-8 ${isMobile ? 'pt-20' : 'pt-36'} pb-28 max-w-2xl flex flex-col items-center`}>
        {/* Profile Avatar */}
        <div className="relative mb-4">
          <Avatar className="h-24 w-24 border-2 border-theater-gold">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className="bg-neutral-800 text-white text-xl">
              {userName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="absolute bottom-0 right-0 bg-purple-600 rounded-full p-1.5 border border-black">
            <Camera className="h-4 w-4 text-white" />
          </div>
        </div>
        
        {/* User Name */}
        <h1 className="text-2xl font-bold flex items-center mb-1">
          {userName}
          <button className="ml-2 text-neutral-400">
            <Settings className="h-4 w-4" />
          </button>
        </h1>
        
        {/* User Email */}
        <p className="text-neutral-400 mb-8">{userEmail}</p>
        
        {/* Stats Card */}
        <Card className="w-full mb-8 bg-neutral-900 border-neutral-800">
          <div className="grid grid-cols-3 divide-x divide-neutral-800">
            <div className="p-4 text-center">
              <p className="text-xl font-bold">{performanceCount}</p>
              <p className="text-sm text-neutral-400">Performances</p>
            </div>
            <div className="p-4 text-center">
              <p className="text-xl font-bold">{averageScore}%</p>
              <p className="text-sm text-neutral-400">Avg. Score</p>
            </div>
            <div className="p-4 text-center">
              <p className="text-xl font-bold">{usage?.subscription_tier === 'pro' ? 'Pro' : 'Basic'}</p>
              <p className="text-sm text-neutral-400">Plan</p>
            </div>
          </div>
        </Card>
        
        {/* Subscription Section */}
        <div className="w-full mb-6">
          <h2 className="text-xl font-bold mb-4">Subscription</h2>
          <Card className="bg-neutral-900 border-neutral-800 p-5">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-bold">Pro Plan</h3>
                <p className="text-theater-gold">€7.99/month</p>
                <p className="text-sm text-neutral-400">Renews on {subscriptionRenewalDate}</p>
              </div>
              <Button className="bg-theater-gold hover:bg-theater-gold/90 text-black">
                Upgrade
              </Button>
            </div>
          </Card>
        </div>
        
        {/* Settings Section */}
        <div className="w-full mb-6">
          <h2 className="text-xl font-bold mb-4">Settings</h2>
          <Card className="bg-neutral-900 border-neutral-800 overflow-hidden">
            <Link to="/account-settings" className="flex items-center justify-between p-5 hover:bg-neutral-800">
              <div className="flex items-center">
                <div className="bg-neutral-800 p-3 rounded-full mr-4">
                  <Settings className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold">Account Settings</h3>
                  <p className="text-sm text-neutral-400">Manage your account preferences</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-neutral-400" />
            </Link>
            
            <div className="border-t border-neutral-800"></div>
            
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-between p-5 hover:bg-neutral-800"
            >
              <div className="flex items-center">
                <div className="bg-neutral-800 p-3 rounded-full mr-4">
                  <LogOut className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <h3 className="font-bold">Sign Out</h3>
                  <p className="text-sm text-neutral-400">Log out of your account</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-neutral-400" />
            </button>
          </Card>
        </div>
      </div>
      
      {/* Fixed bottom menu - only visible on mobile */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-neutral-950 py-4 border-t border-neutral-900">
          <div className="container mx-auto max-w-md">
            <div className="flex justify-around">
              <Link to="/dashboard" className="flex flex-col items-center space-y-2">
                <div className="bg-neutral-900 rounded-full p-4">
                  <LayoutDashboard className="h-6 w-6 text-white" />
                </div>
                <span className="text-sm text-white">Dashboard</span>
              </Link>
              
              <Link to="/upload" className="flex flex-col items-center space-y-2">
                <div className="bg-neutral-900 rounded-full p-4">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <span className="text-sm text-white">Upload</span>
              </Link>
              
              <Link to="/chat" className="flex flex-col items-center space-y-2">
                <div className="bg-neutral-900 rounded-full p-4">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <span className="text-sm text-white">Coach</span>
              </Link>
              
              <Link to="/profile" className="flex flex-col items-center space-y-2">
                <div className="bg-neutral-900 rounded-full p-4">
                  <User className="h-6 w-6 text-white" />
                </div>
                <span className="text-sm text-white">Profile</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
