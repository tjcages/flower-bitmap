import { Asset, File } from "@/store/types";
import { proxy, subscribe, useSnapshot } from "valtio";

type OnboardingState = "intro" | "activation" | "unlocks";

interface State {
  // General States
  activated: boolean;
  hoveringPreview: boolean;
  // Onboarding States
  onboarding: OnboardingState;
}

const defaultState: State = {
  // General States
  activated: false,
  hoveringPreview: false,
  // Onboarding States
  onboarding: "intro"
};

function loadState(): State {
  if (typeof window === "undefined") {
    return defaultState;
  }

  try {
    const savedState = localStorage.getItem("persistentState");
    if (savedState) {
      const parsedState = JSON.parse(savedState) as Partial<State>;
      return { ...defaultState, ...parsedState };
    }
  } catch (error) {
    console.error("Failed to load state from localStorage:", error);
  }
  return defaultState;
}

const state = proxy<State>(defaultState);

if (typeof window !== "undefined") {
  // Initialize state on the client side
  const loadedState = loadState();
  Object.assign(state, loadedState);

  subscribe(state, () => {
    console.log("subscriber", state);
    try {
      localStorage.setItem("persistentState", JSON.stringify(state));
    } catch (error) {
      console.error("Failed to save state to localStorage:", error);
    }
  });
}

export { state, useSnapshot };
export type { Asset, File, OnboardingState, State };
