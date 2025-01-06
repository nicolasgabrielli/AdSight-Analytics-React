import logo from './logo.svg';
import './App.css';
import AgenciaMedios from './components/AgenciaMedios';
import DueniosPantallas from './components/DueniosPantallas';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
const theme = createTheme({
  palette: {
      mode: "dark",
      primary: {
          main: "#CAFFFF", // Azul claro
      },
      secondary: {
          main: "#FFD700", // Amarillo
      },
      background: {
          default: "#1E1F21", // Fondo oscuro
          paper: "#2E2E30", // Fondo de contenedores
          paper2: "#3A3A3C",
      },
      text: {
          primary: "#CAFFFF", // Texto principal
          secondary: "#AAAAAA", // Texto secundario
      },
      error: {
          main: "#FF4500", // Rojo
      },
      warning: {
          main: "#FFA500", // Naranja
      },
      success: {
          main: "#9ACD32", // Verde
      },
  },
  typography: {
    fontFamily: "Poppins, Arial, sans-serif", // Usa la fuente personalizada
  },
});


function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<AgenciaMedios />} />
          <Route path="/agencia-medios" element={<AgenciaMedios />} />
          <Route path="/duenios-pantallas" element={<DueniosPantallas />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
