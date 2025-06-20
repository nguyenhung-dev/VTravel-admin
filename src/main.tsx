import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from "react-router-dom";
import { router } from "@/router";
import { LayoutProvider } from './contexts/LayoutContext';
import { PageTitleProvider } from "@/contexts/PageTitleContext"
import './index.css';
import './styles/global.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LayoutProvider>
      <PageTitleProvider>
        <RouterProvider router={router} />
      </PageTitleProvider>
    </LayoutProvider>
  </StrictMode>,
)
