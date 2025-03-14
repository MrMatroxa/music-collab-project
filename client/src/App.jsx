import "./App.css";
import { Routes, Route } from "react-router-dom";
import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";

import HomePage from "./pages/HomePage/HomePage";
import ProfilePage from "./pages/YourProfilePage/ProfilePage";
import SignupPage from "./pages/SignupPage/SignupPage";
import LoginPage from "./pages/LoginPage/LoginPage";
import NotFoundPage from "./pages/NotFoundPage/NotFoundPage";
import UserProfilePage from "./pages/UserProfilePage/UserProfilePage";

import Navbar from "./components/Navbar/Navbar";
import IsPrivate from "./components/IsPrivate/IsPrivate";
import IsAnon from "./components/IsAnon/IsAnon";
import AddSound from "./pages/AddSound/AddSound";
import SoundTagDetails from "./pages/SoundTagDetails/SoundTagDetais";
import ProjectPage from "./pages/ProjectPage/ProjectPage";
import { LoginGoogle } from "./pages/LoginGoogle/LoginGoogle";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <div className="App">
        <Navbar />

        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route
            path="/profile"
            element={
              <IsPrivate>
                <ProfilePage />
              </IsPrivate>
            }
          />

          <Route
            path="/signup"
            element={
              <IsAnon>
                <SignupPage />
              </IsAnon>
            }
          />
                    <Route
            path="/login/google"
            element={
              <IsAnon>
                <LoginGoogle />
              </IsAnon>
            }
          />
          <Route
            path="/login"
            element={
              <IsAnon>
                <LoginPage />
              </IsAnon>
            }
          />
          <Route path="/sounds/tags/:tagId" element={<SoundTagDetails />} />
          <Route path="/sounds/add" element={<AddSound />} />
          <Route path="/user/:userId" element={<UserProfilePage />} />
          <Route path="/projects/:projectId" element={<ProjectPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </ThemeProvider>
  );
}

export default App;
