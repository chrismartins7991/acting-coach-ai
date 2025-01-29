import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ThreeDCoachCarousel } from "@/components/ui/3d-carousel";
import { useNavigate } from "react-router-dom";

const DebugPage = () => {
  const navigate = useNavigate();
  
  const coaches = [
    {
      name: "Constantin Stanislavski",
      description: "Master of emotional memory and the 'magic if' technique",
      image: "/Acting-Methods-Iconic-Coaches/Stanislavski-Portrait-Enhanced.png",
      contribution: "Method Acting Foundation"
    },
    {
      name: "Lee Strasberg",
      description: "Pioneer of method acting in America",
      image: "/Acting-Methods-Iconic-Coaches/Strasberg-Portrait-Enhanced.png",
      contribution: "Psychological Realism"
    },
    {
      name: "Bertolt Brecht",
      description: "Pioneer of epic theater and alienation effect",
      image: "/Acting-Methods-Iconic-Coaches/Brecht-Portrait-Enhanced.png",
      contribution: "Epic Theater"
    },
    {
      name: "Michael Chekhov",
      description: "Master of psychological gesture technique",
      image: "/Acting-Methods-Iconic-Coaches/Chekhov-Portrait-Enhanced.png",
      contribution: "Psychological Gesture"
    },
    {
      name: "Sanford Meisner",
      description: "Developer of the Meisner technique",
      image: "/Acting-Methods-Iconic-Coaches/Meisner-Portrait-Enhanced.png",
      contribution: "Repetition Technique"
    }
  ];

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <Card className="p-6 bg-black/30 backdrop-blur-sm border-white/10">
          <h1 className="text-3xl font-bold text-white mb-8 text-center">Iconic Acting Coaches</h1>
          <ThreeDCoachCarousel coaches={coaches} />
        </Card>
      </div>
    </div>
  );
};

export default DebugPage;