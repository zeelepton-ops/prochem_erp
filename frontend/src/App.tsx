import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContextProvider } from '@context/AuthProvider';
import { Navbar } from '@components/Navbar';
import { ProtectedRoute } from '@components/ProtectedRoute';
import { HomePage } from '@pages/HomePage';
import { LoginPage } from '@pages/LoginPage';
import { RegisterPage } from '@pages/RegisterPage';
import { DashboardPage } from '@pages/DashboardPage';
import { PurchaseOrdersPage } from '@pages/PurchaseOrdersPage';
import { CreatePurchaseOrderPageV2 } from '@pages/CreatePurchaseOrderPageV2';
import { SalesOrdersPage } from '@pages/SalesOrdersPage';
import { CreateSalesOrderPageV2 } from '@pages/CreateSalesOrderPageV2';
import { MaterialTestsPage } from '@pages/MaterialTestsPage';
import { CreateMaterialTestPageV2 } from '@pages/CreateMaterialTestPageV2';
import { ProductionPage } from '@pages/ProductionPage';
import { CreateProductionPageV2 } from '@pages/CreateProductionPageV2';
import { DeliveryNotesPage } from '@pages/DeliveryNotesPage';
import { CreateDeliveryNotePageV2 } from '@pages/CreateDeliveryNotePageV2';
import { AuditLogsPage } from '@pages/AuditLogsPage';
import { SuppliersPage } from '@pages/SuppliersPage';
import { CustomersPage } from '@pages/CustomersPage';
import { MaterialsPage } from '@pages/MaterialsPage';
import './styles/global.css';

function App() {
  return (
    <Router>
      <AuthContextProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Dashboard Route */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Purchase Orders Routes */}
          <Route
            path="/purchase-orders"
            element={
              <ProtectedRoute>
                <PurchaseOrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/purchase-orders/new"
            element={
              <ProtectedRoute>
                <CreatePurchaseOrderPageV2 />
              </ProtectedRoute>
            }
          />

          {/* Sales Orders Routes */}
          <Route
            path="/sales-orders"
            element={
              <ProtectedRoute>
                <SalesOrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales-orders/new"
            element={
              <ProtectedRoute>
                <CreateSalesOrderPageV2 />
              </ProtectedRoute>
            }
          />

          {/* Material Tests Routes */}
          <Route
            path="/material-tests"
            element={
              <ProtectedRoute>
                <MaterialTestsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/material-tests/new"
            element={
              <ProtectedRoute>
                <CreateMaterialTestPageV2 />
              </ProtectedRoute>
            }
          />

          {/* Production Routes */}
          <Route
            path="/production"
            element={
              <ProtectedRoute>
                <ProductionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/production/new"
            element={
              <ProtectedRoute>
                <CreateProductionPageV2 />
              </ProtectedRoute>
            }
          />

          {/* Delivery Notes Routes */}
          <Route
            path="/delivery-notes"
            element={
              <ProtectedRoute>
                <DeliveryNotesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/delivery-notes/new"
            element={
              <ProtectedRoute>
                <CreateDeliveryNotePageV2 />
              </ProtectedRoute>
            }
          />

          {/* Audit Logs Routes */}
          <Route
            path="/audit-logs"
            element={
              <ProtectedRoute>
                <AuditLogsPage />
              </ProtectedRoute>
            }
          />

          {/* Master Data Routes - Suppliers */}
          <Route
            path="/suppliers"
            element={
              <ProtectedRoute>
                <SuppliersPage />
              </ProtectedRoute>
            }
          />

          {/* Master Data Routes - Customers */}
          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <CustomersPage />
              </ProtectedRoute>
            }
          />

          {/* Master Data Routes - Materials/Inventory */}
          <Route
            path="/materials"
            element={
              <ProtectedRoute>
                <MaterialsPage />
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthContextProvider>
    </Router>
  );
}

export default App;
