import { createBrowserRouter } from "react-router-dom";
import MainLayout from "@layouts/main-layout";
import NotFound from "@pages/not-found";
import HomePage from "@pages/home";
import { Employee, Customer, CreateUser, UpdateUser } from "@pages/users";
import { TourList } from "@pages/tours";
import { DestinationList } from "@pages/destinations";
import LoginPage from "@/pages/auth/login";
import ProtectedRoute from "@/contexts/ProtectedRoute ";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />
  },
  {
    path: "/",
    element:
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>,
    children: [
      { index: true, element: <HomePage /> },
      { path: "user/employee", element: <Employee /> },
      { path: "user/customer", element: <Customer /> },
      { path: "user/create", element: <CreateUser /> },
      { path: "user/update/:id", element: <UpdateUser /> },
      { path: "tours", element: <TourList /> },
      { path: "destination-list", element: <DestinationList /> },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
])