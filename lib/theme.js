import {createContext, useContext} from "react";

export const ThemeContext = createContext({
  theme: "dark",
  setTheme: _theme => {},
});

export const useTheme = () => useContext(ThemeContext);
