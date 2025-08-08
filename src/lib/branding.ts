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
  logoLight: "/clients/shadow-goose/logo-light.svg",
  logoDark: "/clients/shadow-goose/logo-dark.svg",
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
  const client = process.env.NEXT_PUBLIC_CLIENT || "navimpact";
  switch (client) {
    case "shadow-goose":
      return shadowGooseBranding;
    default:
      return shadowGooseBranding;
  }
}
