import { proxy, subscribe, useSnapshot } from "valtio";

interface State {
  // General States
  activated: boolean;
}

const defaultState: State = {
  // General States
  activated: false
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
export type { State };
