import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";

import { applyOrientationPreference } from "../services/orientation";
import { DEFAULT_SETTINGS, GameSettings } from "../types/settings";

const STORAGE_KEY = "mobile-game-template/settings";

type GameSettingsContextValue = {
  isReady: boolean;
  settings: GameSettings;
  resetSettings: () => void;
  updateSetting: <Key extends keyof GameSettings>(
    key: Key,
    value: GameSettings[Key]
  ) => void;
};

const GameSettingsContext = createContext<GameSettingsContextValue | null>(null);

export function GameSettingsProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function hydrateSettings() {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);

        if (raw && mounted) {
          const parsed = JSON.parse(raw) as Partial<GameSettings>;
          setSettings({
            ...DEFAULT_SETTINGS,
            ...parsed
          });
        }
      } finally {
        if (mounted) {
          setIsReady(true);
        }
      }
    }

    void hydrateSettings();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [isReady, settings]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    void applyOrientationPreference(settings.orientation);
  }, [isReady, settings.orientation]);

  function updateSetting<Key extends keyof GameSettings>(
    key: Key,
    value: GameSettings[Key]
  ) {
    setSettings((current) => ({
      ...current,
      [key]: value
    }));
  }

  function resetSettings() {
    setSettings(DEFAULT_SETTINGS);
  }

  return (
    <GameSettingsContext.Provider
      value={{
        isReady,
        settings,
        resetSettings,
        updateSetting
      }}
    >
      {children}
    </GameSettingsContext.Provider>
  );
}

export function useGameSettings() {
  const context = useContext(GameSettingsContext);

  if (!context) {
    throw new Error("useGameSettings must be used inside GameSettingsProvider.");
  }

  return context;
}

