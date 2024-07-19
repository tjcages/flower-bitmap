import { useLocalStorage } from "usehooks-ts";

const type = typeof window !== "undefined" ? (window as Window).localStorage : null;

if (type === null) {
  throw new Error("localStorage is not available");
}

type State = {
  onboardingState: "intro" | "activation" | "unlocks";
};

const LocalStorageKeyAndDefaultValue = {
  onboardingState: "intro"
} as State;

export const useLocalStorageState = (key: keyof typeof LocalStorageKeyAndDefaultValue) => {
  const [value, set] = useLocalStorage(key, LocalStorageKeyAndDefaultValue[key]);
  return [value, set] as const;
};
