import { useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { decodeStore, initialStore, type Store } from "./model";
const KEY = "continuum-patient-v1";
export function useStore() {
  const [store, setStore] = useState<Store>(initialStore);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const current = useRef(store);
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  async function load() {
    try {
      const value = decodeStore(await AsyncStorage.getItem(KEY));
      current.current = value;
      setStore(value);
      setError("");
      setReady(true);
    } catch {
      setError(
        "Your saved data could not be loaded. Retry to avoid overwriting it.",
      );
    }
  }
  useEffect(() => {
    void load();
  }, []);
  async function update(recipe: (value: Store) => Store) {
    const task = queue.current
      .catch(() => {})
      .then(async () => {
        const next = recipe(current.current);
        await AsyncStorage.setItem(KEY, JSON.stringify(next));
        current.current = next;
        setStore(next);
      });
    queue.current = task;
    await task;
  }
  async function sync(url: string) {
    const pending = [...current.current.outbox];
    for (const item of pending) {
      const response = await fetch(`${url}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
        signal: AbortSignal.timeout(6000),
      });
      if (!response.ok)
        throw new Error(
          "The clinic could not accept this update. It is still saved on this device.",
        );
      await update((value) => ({
        ...value,
        outbox: value.outbox.filter((x) => x.id !== item.id),
      }));
    }
    return pending.length;
  }
  return { store, ready, error, load, update, sync };
}
