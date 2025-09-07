// =================================================================
interface CustomPaletteColor {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  600: string;
  700: string;
  800: string;
  900: string;
  main: string;
  contrastText: string;
}

declare module "@mui/material/styles" {
  interface Palette {
    dark: CustomPaletteColor;
    paste: CustomPaletteColor;
    marron: CustomPaletteColor;
    orange: CustomPaletteColor;
    bluish: CustomPaletteColor;
  }

  interface PaletteOptions {
    gold: CustomPaletteColor;
    dark: CustomPaletteColor;
    paste: CustomPaletteColor;
    marron: CustomPaletteColor;
    orange: CustomPaletteColor;
    bluish: CustomPaletteColor;
  }
}
// =================================================================

export const grey = {
  900: "#1A242E", // Main Text
  800: "#2D3842", // Paragraph
  700: "#404C57",
  600: "#53606C", // Low Priority form Title/Text
  500: "#87919E",
  400: "#9BA5B2", // Border
  300: "#AFB9C6",
  200: "#C3CDDA", // Line Stroke
  100: "#D7E1EE"
};

export const primary = {
  100: "#FDF0F7",
  200: "#F9D5E8",
  300: "#F4A6D0",
  400: "#EC66A3",
  500: "#E40066",
  600: "#CC0059",
  700: "#A6004A",
  800: "#80003B",
  900: "#5A002C"
};

export const secondary = {
  100: "#E8F1FF",
  200: "#C5DDFF",
  300: "#9BC4FF",
  400: "#6BA5FF",
  500: "#3E7FE8",
  600: "#0F3460",
  700: "#0C2A4F",
  800: "#08203F",
  900: "#05162F",
  main: "#0F3460",
  dark: "#05162F"
};

export const error = {
  100: "#FFEAEA",
  200: "#FFCBCB",
  300: "#FFA9A9",
  400: "#FF6D6D",
  500: "#FF5353",
  600: "#FF4C4C",
  700: "#FF4242",
  800: "#FF3939",
  900: "#FF2929",
  main: "#E94560"
};

export const success = {
  100: "#E7F9ED",
  200: "#C2F1D1",
  300: "#99E8B3",
  400: "#52D77E",
  500: "#33D067",
  600: "#2ECB5F",
  700: "#27C454",
  800: "#20BE4A",
  900: "#0b7724",
  main: "rgb(51, 208, 103)"
};

export const blue = {
  50: "#f3f5f9",
  100: "#DBF0FE",
  200: "#B8DEFE",
  300: "#94C9FE",
  400: "#7AB6FD",
  500: "#4E97FD",
  600: "#3975D9",
  700: "#2756B6",
  800: "#183C92",
  900: "#0E2979",
  main: "#4E97FD",
  contrastText: "#FFFFFF"
};

export const marron = {
  50: "#f3f5f9",
  100: "#F6F2ED",
  200: "#F8DBD1",
  300: "#EBBCB3",
  400: "#D89C98",
  600: "#A3545C",
  700: "#883948",
  800: "#6E2438",
  900: "#5B162F",
  main: "#BE7374"
};

export const paste = {
  50: "#F5F5F5",
  100: "#DDFBF1",
  200: "#BDF7E8",
  300: "#97E8DA",
  400: "#76D2CA",
  600: "#36929A",
  700: "#257181",
  800: "#175368",
  900: "#0E3D56",
  main: "#4BB4B4",
  contrastText: "#FFFFFF"
};

export const orange = {
  50: "#FEE9D2",
  100: "#FDD8AF",
  200: "#FCC487",
  300: "#FCB05F",
  400: "#FB9C37",
  500: "#FA8C16",
  600: "#C86904",
  700: "#A05403",
  800: "#783F03",
  900: "#502A02",
  main: "#FA8C16",
  dark: "#C86904",
  light: "#FDD8AF"
};

export const bluish = {
  100: "#DDFBF1",
  200: "#BDF7E8",
  300: "#97E8DA",
  400: "#76D2CA",
  500: "#4BB4B4",
  600: "#36929A",
  700: "#257181",
  800: "#175368",
  900: "#0E3D56",
  main: "#4BB4B4",
  dark: "#36929A",
  light: "#BDF7E8"
};

export const warning = {
  100: "#FFF8E5",
  main: "#FFCD4E",
  dark: "#FA8C16",
  contrastText: "#FFFFFF"
};

export const gold = {
  main: "#BB9C36"
};

export const dark = { main: "#1F2937" };
export const white = { main: "#fff" };

export const themeColors = {
  dark,
  grey,
  gold,
  paste,
  error,
  orange,
  marron,
  bluish,
  warning,
  success,
  secondary,
  info: blue,
  divider: grey[200],
  background: { default: white.main },
  text: { primary: '#2A3440', secondary: grey[800], disabled: grey[400] }
};
