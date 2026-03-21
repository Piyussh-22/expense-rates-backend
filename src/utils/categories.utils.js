export const CATEGORIES = {
  expense: [
    "food",
    "house",
    "education",
    "transport",
    "health",
    "entertainment",
    "other",
  ],
  earn: ["salary", "gift", "bonus", "freelance", "other"],
  invest: ["gold", "real estate", "silver", "stocks", "crypto", "other"],
};

export const isValidCategory = (type, category) => {
  return CATEGORIES[type]?.includes(category);
};
