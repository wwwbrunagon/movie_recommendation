import {
	BrowserRouter,
	Route,
	Routes,
} from "react-router-dom";

import { LoginPage } from "../features/auth/pages/Login/LoginPage";
import { RegisterPage } from "../features/auth/pages/Register/RegisterPage";
import { HomePage } from "../features/movies/pages/Home/HomePage";

import { ProtectedRoute } from "./ProtectedRoute";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/register"
          element={<RegisterPage />}
        />

        <Route
          element={<ProtectedRoute />}
        >
          <Route
            path="/"
            element={<HomePage />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
