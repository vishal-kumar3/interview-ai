"use server"

import ForgetPassword from "@/components/form/auth/ForgetPassword";



const ForgotPasswordPage = ({ searchParams }: { searchParams: { token: string | null } }) => {
  const queryParams = searchParams?.token || null;

  return (
    <ForgetPassword token={queryParams} />
  )
};

export default ForgotPasswordPage;
