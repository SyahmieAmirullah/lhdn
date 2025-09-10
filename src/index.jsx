import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

// CSS & styles
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

// Pages / Components
import Login from "./Login";
import Register from "./Register";
import UserProfile from "./UserProfile";
import UserProfileEdit from "./UserProfileEdit";  // Import UserProfileEdit
import Menu from "./Menu";
import Efiling from "./Efiling";
import BE from "./BE";
import TaxInfo from "./TaxInfo";
import ProtectedRoute from "./ProtectedRoute";
import ResetPassword from "./ResetPassword";
import UserProfileAdd from "./UserProfileAdd";
import Payment from "./payment";
import InsertPayment from "./insertpayment";
import Dependent from "./dependent";

// Admin Components
import AdminMenu from "./AdminMenu";
import UserManagement from "./UserManagement";
import TaxManagement from "./TaxManagement";
import AdminAddClass from "./AdminAddClass";
import ProtectedRouteAdmin from "./ProtectedRouteAdmin";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected User Routes */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/add"
          element={
            <ProtectedRoute>
              <UserProfileAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/edit"
          element={
            <ProtectedRoute>
              <UserProfileEdit />
            </ProtectedRoute>
          }
        />
        <Route
          path="/menu"
          element={
            <ProtectedRoute>
              <Menu />
            </ProtectedRoute>
          }
        />
        <Route path="/resetpassword" 
        element={<ResetPassword />} />

        <Route
          path="/efiling"
          element={
            <ProtectedRoute>
              <Efiling />
            </ProtectedRoute>
          }
        />
        <Route
          path="/BE"
          element={
            <ProtectedRoute>
              <BE />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tax"
          element={
            <ProtectedRoute>
              <TaxInfo />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment"
          element={
            <ProtectedRoute>
              <Payment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dependent"
          element={
            <ProtectedRoute>
              <Dependent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/insertpayment/:submitId"
          element={
            <ProtectedRoute>
              <InsertPayment />
            </ProtectedRoute>
          }
        />
        {/* Protected Admin Routes */}
        <Route
          path="/adminmenu"
          element={
            <ProtectedRouteAdmin>
              <AdminMenu />
            </ProtectedRouteAdmin>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRouteAdmin>
              <UserManagement />
            </ProtectedRouteAdmin>
          }
        />
        <Route
          path="/admin/addclass"
          element={
            <ProtectedRouteAdmin>
              <AdminAddClass />
            </ProtectedRouteAdmin>
          }
        />

        <Route
          path="/admin/tax"
          element={
            <ProtectedRouteAdmin>
              <TaxManagement />
            </ProtectedRouteAdmin>
          }
        />

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
