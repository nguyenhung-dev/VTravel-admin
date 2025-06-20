import { createBrowserRouter } from "react-router-dom";
import MainLayout from "@layouts/main-layout";
import NotFound from "@pages/not-found";
import HomePage from "@pages/home";
import { Employee, Customer } from "@pages/users";
import { TourList } from "@pages/tours";
import { DestinationList } from "@pages/destinations"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "user/employee", element: <Employee /> },
      { path: "user/customer", element: <Customer /> },
      { path: "tours", element: <TourList /> },
      { path: "destination-list", element: <DestinationList /> },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
])