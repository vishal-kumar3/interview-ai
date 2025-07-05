"use client"
import { signIn } from 'next-auth/react'
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { GitHubLogoIcon } from "@radix-ui/react-icons";

const SocialLogin = () => {
  const googleAuth = async () => {
    signIn("google", { redirectTo: DEFAULT_LOGIN_REDIRECT });
  };

  const githubAuth = async () => {
    signIn("github", { redirectTo: DEFAULT_LOGIN_REDIRECT });
  }

  return (
    <div className="flex gap-2 items-center justify-center">
      <Button
        onClick={() => googleAuth()}
        className="w-full"
        variant={"outline"}
        size={"lg"}
      >
        <FcGoogle />
      </Button>
      <Button
        onClick={() => githubAuth()}
        className="w-full"
        variant={"outline"}
        size={"lg"}
      >
        <GitHubLogoIcon />
      </Button>
    </div>
  );
};

export default SocialLogin;
