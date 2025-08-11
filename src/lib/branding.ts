export interface BrandingConfig {
  name: string;
  logoLight: string;
  logoDark: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
}

export const shadowGooseBranding: BrandingConfig = {
  name: "Shadow Goose Entertainment",
  logoLight: "/clients/shadow-goose/favicon-32x32.png",
  logoDark: "/clients/shadow-goose/favicon-32x32.png",
  colors: {
    primary: "#1A1A1A",
    secondary: "#FFFFFF",
    accent: "#FF6600",
    background: "#F5F5F5",
  },
  fonts: {
    heading: "Poppins",
    body: "Open Sans",
  },
};

export function getBranding(): BrandingConfig {
  const client = process.env.NEXT_PUBLIC_CLIENT || "shadow-goose";
  switch (client) {
    case "shadow-goose":
      return shadowGooseBranding;
    default:
      return shadowGooseBranding;
  }
} 