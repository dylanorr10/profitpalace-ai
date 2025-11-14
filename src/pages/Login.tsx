import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { checkSubscription } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Welcome back!",
        description: "You've successfully logged in.",
      });
      
      // Trigger subscription check
      await checkSubscription();
      
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 page-transition">
      <Card className="w-full max-w-md p-8 space-y-6 border-primary/20 animate-fade-in">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-primary">Welcome Back</h1>
          <p className="text-muted-foreground">Log in to continue your learning journey</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="focus:ring-primary focus:border-primary"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="focus:ring-primary focus:border-primary"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/signup")}
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Sign up
            </button>
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            <button
              onClick={() => navigate("/terms")}
              className="underline hover:text-foreground"
            >
              Terms of Service
            </button>
            {" "}•{" "}
            <button
              onClick={() => navigate("/privacy")}
              className="underline hover:text-foreground"
            >
              Privacy Policy
            </button>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Login;
