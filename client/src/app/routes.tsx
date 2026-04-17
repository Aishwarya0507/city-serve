import { createBrowserRouter, Navigate } from "react-router";
import React, { Suspense, lazy } from 'react';
import { CustomerLayout } from "./components/layouts/CustomerLayout";
import { ProviderLayout } from "./components/layouts/ProviderLayout";
import { AdminLayout } from "./components/layouts/AdminLayout";
import { PageWrapper } from "./components/layouts/PageWrapper";

// Standard components (not lazy) for stability
import { LandingPage } from "./components/LandingPage";
import { Login } from "./components/auth/Login";
import { Signup } from "./components/auth/Signup";
import { CustomerDashboard } from "./components/customer/CustomerDashboard";
import { ServiceListing } from "./components/customer/ServiceListing";
import { BookingPage } from "./components/customer/BookingPage";
import { BookingStatus } from "./components/customer/BookingStatus";
import { Favorites } from "./components/customer/Favorites";
import { ProfileSettings } from "./components/customer/ProfileSettings";
import { HelpCenter } from "./components/customer/HelpCenter";
import { ProviderDashboard } from "./components/provider/ProviderDashboard";
import { BookingManagement } from "./components/provider/BookingManagement";
import { ScheduleView } from "./components/provider/ScheduleView";
import { ServiceManagement } from "./components/provider/ServiceManagement";
import { ProviderAnalytics } from "./components/provider/ProviderAnalytics";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { ProviderApproval } from "./components/admin/ProviderApproval";
import { LocationManagement } from "./components/admin/LocationManagement";
import { CategoryManagement } from "./components/admin/CategoryManagement";
import { BookingMonitoring } from "./components/admin/BookingMonitoring";
import { AdminProfile } from "./components/admin/AdminProfile";
import { AdminSettings } from "./components/admin/AdminSettings";
import { ServiceApproval } from "./components/admin/ServiceApproval";
import { HelpManagement } from "./components/admin/HelpManagement";
import { AvailabilitySetup } from "./components/provider/AvailabilitySetup";

// Lazy Loaded only for minor pages
const NotFound = lazy(() => import("./components/NotFound").then(module => ({ default: module.NotFound })));
const Offline = lazy(() => import("./components/Offline").then(module => ({ default: module.Offline })));

const Loading = () => (
  <div className="flex items-center justify-center p-8 min-h-[400px]">
    <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: <PageWrapper><LandingPage /></PageWrapper>,
  },
  {
    path: "/help",
    element: <PageWrapper><HelpCenter /></PageWrapper>,
  },
  {
    path: "/login",
    element: <PageWrapper><Login /></PageWrapper>,
  },
  {
    path: "/signup",
    element: <PageWrapper><Signup /></PageWrapper>,
  },
  {
    path: "/offline",
    element: <Suspense fallback={<Loading />}><PageWrapper><Offline /></PageWrapper></Suspense>,
  },
  {
    path: "/customer",
    element: <CustomerLayout />,
    children: [
      { index: true, element: <PageWrapper><CustomerDashboard /></PageWrapper> },
      { path: "services", element: <PageWrapper><ServiceListing /></PageWrapper> },
      { path: "services/:category", element: <PageWrapper><ServiceListing /></PageWrapper> },
      { path: "book/:serviceId", element: <PageWrapper><BookingPage /></PageWrapper> },
      { path: "bookings", element: <PageWrapper><BookingStatus /></PageWrapper> },
      { path: "favorites", element: <PageWrapper><Favorites /></PageWrapper> },
      { path: "settings", element: <PageWrapper><ProfileSettings /></PageWrapper> },
      { path: "help", element: <PageWrapper><HelpCenter /></PageWrapper> },
    ],
  },
  {
    path: "/provider",
    element: <ProviderLayout />,
    children: [
      { index: true, element: <PageWrapper><ProviderDashboard /></PageWrapper> },
      { path: "bookings", element: <PageWrapper><BookingManagement /></PageWrapper> },
      { path: "schedule", element: <PageWrapper><ScheduleView /></PageWrapper> },
      { path: "services", element: <PageWrapper><ServiceManagement /></PageWrapper> },
      { path: "analytics", element: <PageWrapper><ProviderAnalytics /></PageWrapper> },
      { path: "profile", element: <PageWrapper><ProfileSettings /></PageWrapper> },
      { path: "availability", element: <PageWrapper><AvailabilitySetup /></PageWrapper> },
      { path: "help", element: <PageWrapper><HelpCenter /></PageWrapper> },
    ],
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { index: true, element: <PageWrapper><AdminDashboard /></PageWrapper> },
      { path: "providers", element: <PageWrapper><ProviderApproval /></PageWrapper> },
      { path: "locations", element: <PageWrapper><LocationManagement /></PageWrapper> },
      { path: "categories", element: <PageWrapper><CategoryManagement /></PageWrapper> },
      { path: "bookings", element: <PageWrapper><BookingMonitoring /></PageWrapper> },
      { path: "services", element: <PageWrapper><ServiceApproval /></PageWrapper> },
      { path: "profile", element: <PageWrapper><AdminProfile /></PageWrapper> },
      { path: "settings", element: <PageWrapper><AdminSettings /></PageWrapper> },
      { path: "help", element: <PageWrapper><HelpManagement /></PageWrapper> },
    ],
  },
  {
    path: "*",
    element: <Suspense fallback={<Loading />}><PageWrapper><NotFound /></PageWrapper></Suspense>,
  },
]);
