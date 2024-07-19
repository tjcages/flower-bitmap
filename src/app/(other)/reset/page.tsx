"use client";

import { state } from "@/store";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function _() {
  state.activated = false;
  state.onboarding = "intro";

  useEffect(() => {
    redirect("/");
  }, []);

  return null;
}
