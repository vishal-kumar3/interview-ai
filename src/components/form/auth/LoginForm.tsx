"use server"
import SocialLogin from "@/components/auth/SocialLogin";

const LoginForm = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
      <h1 className="text-3xl text-neutral-700 font-medium text-center">
        Login
      </h1>
      <SocialLogin />
    </div>
  );
};

export default LoginForm;
