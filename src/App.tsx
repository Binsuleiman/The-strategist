/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { Navbar } from "./components/Navbar";
import { ToastContainer } from "./components/ToastContainer";
import { LandingPage } from "./views/LandingPage";
import { OnboardingView } from "./views/OnboardingView";
import { DashboardView } from "./views/DashboardView";
import { DiscoverView } from "./views/DiscoverView";
import { IdeaDetailView } from "./views/IdeaDetailView";
import { CompareView } from "./views/CompareView";
import { SavedWorkspaceView } from "./views/SavedWorkspaceView";
import { SettingsView } from "./views/SettingsView";

const AppContent: React.FC = () => {
  const { currentView } = useApp();

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#EDEDED] font-sans antialiased selection:bg-[#F59E0B] selection:text-[#0A0A0B]">
      <Navbar />
      <main>
        {currentView === "landing" && <LandingPage />}
        {currentView === "onboarding" && <OnboardingView />}
        {currentView === "dashboard" && <DashboardView />}
        {currentView === "discover" && <DiscoverView />}
        {currentView === "idea-detail" && <IdeaDetailView />}
        {currentView === "compare" && <CompareView />}
        {currentView === "saved" && <SavedWorkspaceView />}
        {currentView === "settings" && <SettingsView />}
      </main>
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
