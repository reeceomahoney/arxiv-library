"use client";

import Image from "next/image";
import { signIn } from "next-auth/react";

import { Button } from "~/app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/app/components/ui/card";

export default function SignInPage() {
  const handleSignIn = async (provider: string) => {
    await signIn(provider, { callbackUrl: "/" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="!m-8 mx-auto w-full shadow-md md:w-1/2 lg:w-1/6">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Sign In</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <Button onClick={() => handleSignIn("google")} className="w-full">
              <div className="flex items-center gap-2">
                <Image src="/google.png" alt="Google" width={24} height={24} />
                Sign in with Google
              </div>
            </Button>
            <Button onClick={() => handleSignIn("github")} className="w-full">
              <div className="flex items-center gap-2">
                <Image src="/github.svg" alt="GitHub" width={24} height={24} />
                Sign in with GitHub
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
