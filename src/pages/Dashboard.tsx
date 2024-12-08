import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Camera, FileVideo, History } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  if (!user) {
    return <Navigate to="/" replace />;
  }

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
    <div className="min-h-screen bg-gradient-to-br from-theater-purple via-black to-theater-red">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Welcome to Your Acting Studio</h1>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="text-white hover:text-theater-gold"
          >
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Record Performance",
              description: "Use your camera to record a new performance",
              icon: Camera,
              color: "from-blue-500 to-blue-600",
            },
            {
              title: "Upload Video",
              description: "Upload an existing video for analysis",
              icon: FileVideo,
              color: "from-purple-500 to-purple-600",
            },
            {
              title: "View History",
              description: "Review your past performances and feedback",
              icon: History,
              color: "from-green-500 to-green-600",
            },
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group cursor-pointer"
            >
              <div className={`p-6 rounded-lg bg-gradient-to-br ${feature.color} transform transition-all duration-300 group-hover:scale-105 shadow-xl`}>
                <feature.icon className="w-12 h-12 text-white mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-white/80">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;