import "./App.css";
import Home from "./pages/home";
import Template from "./pages/template";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/template" element={<Template />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
