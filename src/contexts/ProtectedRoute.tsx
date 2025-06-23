import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="w-screen h-screen flex justify-center items-center">
        <DotLottieReact
          src="https://lottie.host/be7cc8d4-b7a5-4b6d-a414-780ef08c48c7/ycQD1TSzmS.lottie"
          loop
          autoplay
          className="w-[300px]"
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;

}
