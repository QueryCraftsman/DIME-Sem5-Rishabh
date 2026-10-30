export const getUserDisplayName = (
  name?: string | null,
  email?: string | null,
) => {
  if (name && name.trim()) {
    return name.trim();
  }

  if (email && email.trim()) {
    return email.trim().split("@")[0];
  }

  return "User";
};

export const getUserInitials = (value?: string | null) => {
  if (!value) {
    return "U";
  }

  const words = value.trim().split(/\s+/).filter(Boolean).slice(0, 2);

  if (words.length === 0) {
    return "U";
  }

  return words.map((word) => word[0]?.toUpperCase() ?? "").join("");
};

export const getUserAvatarUrl = (
  image?: string | null,
  _email?: string | null,
  _name?: string | null,
): string | null => {
  if (
    image &&
    typeof image === "string" &&
    image.trim() &&
    image.trim() !== "null" &&
    image.trim() !== "undefined"
  ) {
    return image.trim();
  }

  return null;
};
