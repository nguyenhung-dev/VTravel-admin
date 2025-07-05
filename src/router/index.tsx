import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store";
import { fetchUser } from "@/store/authSlice";

import MainLayout from "@layouts/main-layout";
import NotFound from "@pages/not-found";
import HomePage from "@pages/home";
import Profile from "@pages/profile";
import { Employee, Customer, CreateUser, UpdateUser } from "@pages/users";
import { Tours, TourCategory } from "@pages/tours";
import { Destinations, TourDestination } from "@pages/destinations";
import LoginPage from "@/pages/auth/login";
import Authorization from "@/pages/authorization";
import ProtectedRoute from "@/contexts/ProtectedRoute";
import ProtectedRouteRole from "./ProtectedRoute";

export default function AppRoutes() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchUser());
  }, [dispatch]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="authorization"
          element={
            <ProtectedRouteRole allowedRoles={["admin"]}>
              <Authorization />
            </ProtectedRouteRole>
          }
        />
        <Route
          path="user/employee"
          element={
            <ProtectedRouteRole allowedRoles={["admin"]}>
              <Employee />
            </ProtectedRouteRole>
          }
        />
        <Route index element={<HomePage />} />
        {/* === USERS === */}
        <Route path="user/customer" element={<Customer />} />
        <Route path="user/create" element={<CreateUser />} />
        <Route path="user/update/:id" element={<UpdateUser />} />
        <Route path="profile" element={<Profile />} />
        {/* === TOURS === */}
        <Route path="tours" element={<Tours />} />
        <Route path="tours/category" element={<TourCategory />} />
        {/* === DESTINATIONS === */}
        <Route path="destinations" element={<Destinations />} />
        <Route path="destination/category" element={<TourDestination />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
