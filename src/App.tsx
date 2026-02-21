import { ApolloProvider } from '@apollo/client/react'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AuthProvider } from './context/AuthContext'
import { client } from './lib/apollo'
import { Trans_Login } from './pages/Transporter/Auth/TransLogin/Trans_Login'
import { Trans_Register } from './pages/Transporter/Auth/TransRegister/Trans_Register'
import { Trans_ForgotPassword } from './pages/Transporter/Auth/Reset_password'
import { CreateQuotation } from './pages/Transporter/Quotation/createQuotation/createQuotation'
import { QuotationList } from './pages/Transporter/Quotation/QuotationList/quotationList'
import { Trans_DashBoard } from './pages/Transporter/TransDashboard/Trans_Dashboard'
import { TransporterLayout } from './pages/Transporter/TransporterLayout'
import { NoAccess } from './pages/NoAccess'
import { InvoiceDashboard } from './pages/Transporter/Invoice/InvoiceDashboard';
import { CreateInvoiceWizard } from './pages/Transporter/Invoice/CreateInvoice/CreateInvoiceWizard';
import Agreement from './pages/Agreement'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/trans-login" replace />} />
      <Route path="/trans-login" element={<Trans_Login />} />
      <Route path="/trans-register" element={<Trans_Register />} />
      <Route path="/trans-forget-pass" element={<Trans_ForgotPassword />} />
      <Route path="/no-access" element={<NoAccess />} />
      <Route path="/agreement" element={<Agreement />} />

      <Route path="/vendor/quotation/:quotationId" element={<CreateQuotation mode="VENDOR" />} />

      <Route path="/trans-dashboard" element={<TransporterLayout />}>
        <Route index element={<Trans_DashBoard />} />
        <Route path="vendor-quotations/:vendorId" element={<QuotationList />} />
        <Route path="create-quotation/:vendorId" element={<CreateQuotation mode="TRANSPORTER" />} />
        <Route path="quotation-review/:quotationId" element={<CreateQuotation mode="REVIEW" />} />
        
        {/* Invoice Routes */}
        <Route path="invoices" element={<InvoiceDashboard />} />
        <Route path="invoice/create" element={<CreateInvoiceWizard />} />
      </Route>

      {/* Backward compat */}
      <Route path="/create-quotation/:vendorId" element={<CreateQuotation mode="TRANSPORTER" />} />
      <Route path="/vendor-quotations/:vendorId" element={<QuotationList />} />
      <Route path="/quotation-review/:quotationId" element={<CreateQuotation mode="REVIEW" />} />
    </Routes>
  )
}

function App() {
  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        <BrowserRouter>
          <ToastContainer position="top-right" autoClose={3000} />
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ApolloProvider>
  )
}

export default App
