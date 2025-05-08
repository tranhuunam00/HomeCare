import "./App.css";
import Home from "./pages/home";
import Template from "./pages/template";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import TiradPage from "./pages/TIRADS";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/template" element={<Template />} />
        <Route path="/tirads" element={<TiradPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
