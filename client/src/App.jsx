import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Footer from "./components/Footer.jsx";
import Navbar from "./components/Navbar.jsx";
import AdminRoute from "./components/admin/AdminRoute.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import PropertiesPage from "./pages/PropertiesPage.jsx";
import PropertyDetailPage from "./pages/PropertyDetailPage.jsx";
import AdminCreatePropertyPage from "./pages/admin/AdminCreatePropertyPage.jsx";
import AdminEditPropertyPage from "./pages/admin/AdminEditPropertyPage.jsx";
import AdminContactsPage from "./pages/admin/AdminContactsPage.jsx";
import AdminLoginPage from "./pages/admin/AdminLoginPage.jsx";
import AdminPropertiesPage from "./pages/admin/AdminPropertiesPage.jsx";

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen text-slate-800">
      {!isAdminRoute ? <Navbar /> : null}
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/properties" element={<PropertiesPage />} />
          <Route path="/properties/:slug" element={<PropertyDetailPage />} />
          <Route path="/contact" element={<ContactPage />} />

          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<Navigate replace to="/admin/properties" />} />
          <Route
            path="/admin/properties"
            element={
              <AdminRoute>
                <AdminPropertiesPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/properties/create"
            element={
              <AdminRoute>
                <AdminCreatePropertyPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/properties/:id/edit"
            element={
              <AdminRoute>
                <AdminEditPropertyPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/contacts"
            element={
              <AdminRoute>
                <AdminContactsPage />
              </AdminRoute>
            }
          />
        </Routes>
      </main>
      {!isAdminRoute ? <Footer /> : null}
    </div>
  );
}

export default App;
