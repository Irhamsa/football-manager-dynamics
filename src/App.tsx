
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import LineUp from "./pages/LineUp";
import Match from "./pages/Match";
import Simulation from "./pages/Simulation";
import Career from "./pages/Career";
import About from "./pages/About";
import Tactics from "./pages/Tactics";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/index.html" element={<Index />} />
        <Route path="/match" element={<Match />} />
        <Route path="/lineup" element={<LineUp />} />
        <Route path="/tactics" element={<Tactics />} />
        <Route path="/simulation" element={<Simulation />} />
        <Route path="/career" element={<Career />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  );
}

export default App;
