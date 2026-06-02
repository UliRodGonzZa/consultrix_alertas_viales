import React, { useState } from 'react';
import DashboardLayout from './components/templates/DashboardLayout';
import OverviewPage from './components/pages/OverviewPage';
import TraficoPage from './components/pages/TraficoPage';
import AccidentesPage from './components/pages/AccidentesPage';
import ModeloPage from './components/pages/ModeloPage';
import AlertasPage from './components/pages/AlertasPage';
import './App.css';

const PAGES = {
  overview:   OverviewPage,
  trafico:    TraficoPage,
  accidentes: AccidentesPage,
  modelo:     ModeloPage,
  alertas:    AlertasPage,
};

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const PageComponent = PAGES[activeTab] || OverviewPage;

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab} anio={2025}>
      <PageComponent />
    </DashboardLayout>
  );
}
