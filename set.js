export const first = set => {
    const next = set.values().next();
    return next.value === undefined ? undefined : next.value;
  };