import { Routes, Route } from "react-router-dom";
import MainLayout from "@layouts/main-layout";
import NotFound from "@pages/not-found";
import HomePage from "@pages/home";
import { Employee, Customer, CreateUser, UpdateUser } from "@pages/users";
import { TourList } from "@pages/tours";
import { DestinationList } from "@pages/destinations";
import LoginPage from "@/pages/auth/login";
import ProtectedRoute from "@/contexts/ProtectedRoute";

export default function AppRoutes() {
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
        <Route index element={<HomePage />} />
        <Route path="user/employee" element={<Employee />} />
        <Route path="user/customer" element={<Customer />} />
        <Route path="user/create" element={<CreateUser />} />
        <Route path="user/update/:id" element={<UpdateUser />} />
        <Route path="tours" element={<TourList />} />
        <Route path="destination-list" element={<DestinationList />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
