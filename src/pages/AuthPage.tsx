import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthModal } from "@/components/AuthModal";
import { motion } from "framer-motion";

const AuthPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-theater-purple via-black to-theater-red p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to continue your acting journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AuthModal 
              buttonText="Sign in with Email" 
              mode="sign_in"
              variant="primary"
              className="w-full"
            />
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <AuthModal
                  buttonText="Sign up"
                  mode="sign_up"
                  variant="link"
                  className="p-0 h-auto font-semibold hover:text-primary"
                />
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AuthPage;