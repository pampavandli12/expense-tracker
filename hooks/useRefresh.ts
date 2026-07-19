import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
export function useRefresh<T>(loader: () => Promise<T>, initial: T) {
  const [data, setData] = useState(initial); const [loading, setLoading] = useState(true);
  const refresh = useCallback(() => { setLoading(true); loader().then(setData).finally(() => setLoading(false)); }, [loader]);
  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));
  return { data, loading, refresh };
}
