import React from "react";
import {Navigate, Route, HashRouter, Routes} from "react-router-dom";
import Login from "./pages/Login";
import HomeLayout from "./pages/HomeLayout";
import Ticket from "./pages/Ticket";
import Reports from "./pages/Reports";
import AdminRoutes from "./pages/AdminRoutes";
import AdminUsers from "./pages/AdminUsers";
import "./App.css";
import {useAuthState} from "./states/AuthState";
import {ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const isAuthenticated = useAuthState((state) => state.user !== null);

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const user = useAuthState((state) => state.user);
    const isAuthenticated = user !== null;
    const isAdmin = user?.role === "admin";

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }
    if (!isAdmin) {
        return <Navigate to="/home" />;
    }

    return <>{children}</>;
};

const App: React.FC = () => {

    return (
        <HashRouter>
            <Routes>
                <Route index element={<Login />} /> {/* Default route */}
                {/* Login Route */}
                <Route path="/login" element={<Login />} />

                {/* Home Route */}
                <Route path="/home" element={
                    <ProtectedRoute>
                        <HomeLayout />
                    </ProtectedRoute>
                }>
                    <Route index element={<Ticket />} /> {/* Default route */}
                    <Route path="ticket" element={<Ticket />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="admin/routes" element={<AdminRoute><AdminRoutes /></AdminRoute>} />
                    <Route path="admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
                </Route>

                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
            <ToastContainer />
        </HashRouter>
    );
};

export default App;
