import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import Dashboard from "./pages/Dashboard";
import CreateForm from "./pages/CreateForm";
import EditForm from "./pages/EditForm";
import FillForm from "./pages/FillForm";
import FormPreview from "./pages/FormPreview";
import ViewResponses from "./pages/ViewResponses";
import ViewSingleResponse from "./pages/ViewSingleResponse";
import ExportResponses from "./pages/ExportResponses";
import PrivateRoute from "./components/PrivateRoute";
import Navbar from "./components/Navbar";
import { Toaster } from "react-hot-toast";
import FormAnalytics from "./pages/FormAnalytics";

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Toaster position="top-right" />
                <Navbar />
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/auth/callback" element={<AuthCallback />} />

                    <Route path="/form/:formId" element={<FillForm />} />

                    <Route
                        path="/"
                        element={
                            <PrivateRoute>
                                <Dashboard />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/create"
                        element={
                            <PrivateRoute>
                                <CreateForm />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/edit/:formId"
                        element={
                            <PrivateRoute>
                                <EditForm />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/preview/:formId"
                        element={
                            <PrivateRoute>
                                <FormPreview />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/forms/:formId/responses"
                        element={
                            <PrivateRoute>
                                <ViewResponses />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/forms/:formId/responses/:responseId"
                        element={
                            <PrivateRoute>
                                <ViewSingleResponse />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/forms/:formId/export"
                        element={
                            <PrivateRoute>
                                <ExportResponses />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/analytics/:formId"
                        element={
                            <PrivateRoute>
                                <FormAnalytics />
                            </PrivateRoute>
                        }
                    />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}
