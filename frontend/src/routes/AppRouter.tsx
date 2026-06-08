import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import { LoginPage } from "/Login/LoginPage";

import { RegisterPage } from "../Register/RegisterPage";

import { HomePage } from "/HomePage";

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