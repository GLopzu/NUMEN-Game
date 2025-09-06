// src/router/Router.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DrakarDuel from "../pages/NumenDuel.jsx";

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DrakarDuel />} />
      </Routes>
    </BrowserRouter>
  );
};
export default Router;
