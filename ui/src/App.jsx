import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Landing from "./pages/Landing"
import Match from "./pages/Match"
import Profile from "./pages/Profile"
import MatchLoading from "./pages/MatchLoading"
import MatchFound from "./pages/MatchFound"; 

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/match" element={<Match />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/match_loading" element={<MatchLoading />} />
        <Route path="/match_found" element={<MatchFound />} />
      </Routes>
    </Router>
  );
};

export default App;
