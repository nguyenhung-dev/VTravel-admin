import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "@/router";
import { LayoutProvider } from './contexts/LayoutContext';
import { PageTitleProvider } from "@/contexts/PageTitleContext";
import { AuthProvider } from './contexts/AuthContext';
import './index.css';
import './styles/global.css';
import 'antd/dist/reset.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <LayoutProvider>
          <PageTitleProvider>
            <AppRoutes />
          </PageTitleProvider>
        </LayoutProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
