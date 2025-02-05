import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LineUp from "./pages/LineUp";
import Match from "./pages/Match";
import Simulation from "./pages/Simulation";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Match />} />
        <Route path="/lineup" element={<LineUp />} />
        <Route path="/simulation" element={<Simulation />} />
      </Routes>
    </Router>
  );
}

export default App;
