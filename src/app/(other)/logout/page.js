"use client";
import { useEffect } from "react";
import { logout } from "@/components/auth/authServiceV2";

const Logout = () => {
  useEffect(() => {
    const redirectURI = "/login";
    logout(redirectURI);
  }, []);

  return null;
};

export default Logout;
