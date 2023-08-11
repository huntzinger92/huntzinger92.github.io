import { Box, ThemeProvider, createTheme } from "@mui/material";
import "./App.css";
import { ByteChime } from "./components/ByteChime/ByteChime";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <Box>
        <ByteChime />
      </Box>
    </ThemeProvider>
  );
}

export default App;
