"use client";
import { Sparkles, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SocialLogin from "@/components/auth/SocialLogin";
import Link from "next/link";

const LoginForm = () => {
  return (
    <Card className="w-full bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
      <CardHeader className="space-y-6 pb-8">
        <div className="flex items-center justify-center">
          <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
        </div>
        <div className="text-center space-y-3">
          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-gray-500 text-lg max-w-sm mx-auto leading-relaxed">
            Continue your interview preparation journey with us
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-8 px-8 pb-8">
        {/* Social Login */}
        <div className="space-y-4">
          <SocialLogin />
        </div>
        
        {/* Additional info */}
        <div className="text-center">
          <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
