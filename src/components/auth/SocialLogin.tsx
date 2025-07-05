"use client"
import { signIn } from 'next-auth/react'
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { useState } from "react";

const SocialLogin = () => {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGithubLoading, setIsGithubLoading] = useState(false);

  const googleAuth = async () => {
    setIsGoogleLoading(true);
    try {
      await signIn("google", { redirectTo: DEFAULT_LOGIN_REDIRECT });
    } catch (error) {
      setIsGoogleLoading(false);
    }
  };

  const githubAuth = async () => {
    setIsGithubLoading(true);
    try {
      await signIn("github", { redirectTo: DEFAULT_LOGIN_REDIRECT });
    } catch (error) {
      setIsGithubLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <Button
        onClick={googleAuth}
        className="w-full h-12 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 hover:border-gray-300 transition-all duration-200 transform hover:scale-[1.02] shadow-sm hover:shadow-md font-medium"
        variant="outline"
        size="lg"
        disabled={isGoogleLoading || isGithubLoading}
      >
        {isGoogleLoading ? (
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            <span>Connecting with Google...</span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <FcGoogle className="w-5 h-5" />
            <span>Continue with Google</span>
          </div>
        )}
      </Button>

      <Button
        onClick={githubAuth}
        className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white border-0 transition-all duration-200 transform hover:scale-[1.02] shadow-sm hover:shadow-md font-medium"
        size="lg"
        disabled={isGoogleLoading || isGithubLoading}
      >
        {isGithubLoading ? (
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-gray-300 border-t-white rounded-full animate-spin" />
            <span>Connecting with GitHub...</span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <GitHubLogoIcon className="w-5 h-5" />
            <span>Continue with GitHub</span>
          </div>
        )}
      </Button>
    </div>
  );
};

export default SocialLogin;
