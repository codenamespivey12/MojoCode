export const convertRawProvidersToList = (
  raw: { github: string | null } | undefined,
): string[] => {
  if (!raw) return [];
  const list: string[] = [];
  if (raw.github) {
    list.push("github");
  }
  return list;
};
