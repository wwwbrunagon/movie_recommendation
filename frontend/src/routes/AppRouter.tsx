import {
	BrowserRouter,
	Route,
	Routes,
} from "react-router-dom";

import { HomePage } from "../pages/Home/HomePage";
import { LoginPage } from "../pages/Login/LoginPage";
import { RegisterPage } from "../pages/Register/RegisterPage";

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
