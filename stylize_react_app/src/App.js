import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import StyleTransfer from "./pages/StyleTransfer";
import About from "./pages/About";
import "./styles.css";
import Footer from "./components/Footer";
import Cartoonize from "./pages/Cartoonize";


function App() {
  return (
    <div className="app-container">
      <main className="main-content">
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/style-transfer" element={<StyleTransfer />} />
            <Route path="/cartoonize" element={<Cartoonize />} />
            <Route path="/about" element={<About />} />
          </Routes>
          <Footer />
        </Router>
      </main>
      
    </div>
    
  );
}

export default App;
