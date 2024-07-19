import { proxy, subscribe, useSnapshot } from "valtio";

type OnboardingState = "intro" | "activation" | "unlocks";

interface State {
  // General States
  activated: boolean;
  // Onboarding States
  onboarding: OnboardingState;
  // User Controls
  hasSoundPermission: boolean | null;
}

const defaultState: State = {
  // General States
  activated: false,
  // Onboarding States
  onboarding: "intro",
  // User Controls
  hasSoundPermission: null
};

function loadState(): State {
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

const state = proxy<State>(loadState());

subscribe(state, () => {
  console.log("subscriber", state);
  try {
    localStorage.setItem("persistentState", JSON.stringify(state));
  } catch (error) {
    console.error("Failed to save state to localStorage:", error);
  }
});

export { state, useSnapshot };
export type { State, OnboardingState };
