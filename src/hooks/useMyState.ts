import { useState } from "react";

export function useMyState<T>(initialValue: T) {
  const [state, setState] = useState<T>(initialValue);

  return {
    value: state,
    set: (newValue: T) => setState(newValue),
  };
}
