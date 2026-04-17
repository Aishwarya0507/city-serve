# CityServe - Local Service Booking Platform

## 🎯 Overview

CityServe is a comprehensive, production-ready web application for local service booking with three distinct user roles: Customers, Service Providers, and Administrators.

## ✨ Features

### 🔐 Authentication System
- **Login**: Separate authentication for Customer, Provider, and Admin roles
- **Signup**: User registration for Customers and Service Providers
- Smooth transitions with toast notifications
- Form validation

### 👤 Customer Dashboard
1. **Dashboard Home**
   - Location selector with dropdown
   - Service category cards with icons
   - Recent bookings overview
   - Animated loading states (skeleton screens)

2. **Service Listing**
   - Grid layout of service cards
   - Service details: name, provider, price, rating, reviews, duration
   - Book Now functionality
   - Responsive design

3. **Booking Page**
   - Service details sidebar
   - Interactive calendar date picker
   - Time slot selection (Morning/Afternoon/Evening)
   - Booking summary and confirmation
   - Loading animations during booking

4. **Booking Status**
   - Tabbed interface for filtering (All, Pending, Accepted, In Progress, Completed, Rejected)
   - PIN display for accepted bookings (OTP-style input)
   - Rating system for completed services
   - Status badges with color coding

5. **Favorites**
   - Saved services collection
   - Quick booking from favorites
   - Remove from favorites option

### 🧑‍🔧 Service Provider Dashboard
1. **Provider Home**
   - Stats cards (Total Bookings, Completed, Pending, Revenue)
   - Recent bookings list
   - Performance metrics

2. **Booking Management**
   - Accept/Reject booking requests
   - Start service functionality
   - PIN verification for service completion
   - Detailed booking information
   - Customer contact details

3. **Schedule View**
   - Calendar date picker
   - Daily schedule organized by time slots
   - Navigation between dates
   - Booking status indicators

4. **Service Management**
   - Add new services with form
   - Edit existing services (slide-in drawer)
   - Delete services
   - Category, price, and duration management
   - Service descriptions

### 🛠️ Admin Dashboard
1. **Admin Overview**
   - Comprehensive statistics
   - Line chart for booking trends
   - Pie chart for category distribution
   - Recent platform activity feed

2. **Provider Approval**
   - Tabbed view (All, Pending, Approved, Rejected)
   - Provider details with contact info
   - Approve/Reject functionality
   - Performance metrics for approved providers

3. **Location Management**
   - Pending location requests
   - Active locations grid
   - Add new locations
   - Approve/Reject location requests

4. **Category Management**
   - Pending category requests
   - Active categories with icons
   - Add new categories with icon picker
   - Approve/Reject functionality

5. **Booking Monitoring**
   - Comprehensive booking table
   - Search and filter functionality
   - Export option
   - Revenue and stats tracking
   - Status-based filtering

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#2563eb)
- **Background**: Light gray (#f8fafc)
- **Cards**: White
- **Success**: Green
- **Warning**: Yellow
- **Error**: Red

### Design Principles
- Modern, minimal, and clean
- Glassmorphism for modals
- Soft shadows and elevation
- Rounded corners (12px-16px)
- 8px spacing scale
- Responsive grid layouts

### UI Effects & Animations
- **Customer Dashboard**:
  - Skeleton loading screens
  - Staggered reveal animations
  - Pulse effects for notifications
  - Glassmorphism modals
  - Hover and press states

- **Provider Dashboard**:
  - Elevation and soft shadows
  - Slide-in drawers
  - Hover states
  - Inline validation
  - Active indicators

- **Admin Dashboard**:
  - Smooth chart transitions
  - Toast notifications
  - Background blur for modals
  - Color-coded status pulsing
  - Tooltip fade-in effects

## 🗂️ Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── admin/           # Admin dashboard components
│   │   ├── auth/            # Login and Signup
│   │   ├── customer/        # Customer dashboard components
│   │   ├── layouts/         # Layout components for each role
│   │   ├── provider/        # Provider dashboard components
│   │   ├── ui/              # Reusable UI components (Radix UI)
│   │   ├── LandingPage.tsx  # Welcome page
│   │   └── NotFound.tsx     # 404 page
│   ├── lib/
│   │   └── mockData.ts      # Mock data for demonstration
│   ├── App.tsx              # Main app component
│   └── routes.tsx           # React Router configuration
├── styles/
│   ├── animations.css       # Custom animations
│   ├── fonts.css            # Font imports
│   ├── index.css            # Main CSS imports
│   ├── tailwind.css         # Tailwind base
│   └── theme.css            # Theme variables
└── imports/                 # Imported assets
```

## 🚀 Technology Stack

- **React 18** - UI framework
- **React Router 7** - Routing
- **Tailwind CSS v4** - Styling
- **Radix UI** - Accessible components
- **Motion (Framer Motion)** - Animations
- **Recharts** - Charts and graphs
- **Lucide React** - Icons
- **Sonner** - Toast notifications
- **date-fns** - Date manipulation
- **React Day Picker** - Calendar
- **Input OTP** - PIN input

## 🎯 User Flows

### Customer Flow
1. Login/Signup → Select Location
2. Browse Service Categories
3. View Service Listings
4. Book a Service (Select Date & Time)
5. Track Booking Status
6. View PIN when accepted
7. Complete service
8. Rate and Review

### Provider Flow
1. Login/Signup
2. View Dashboard (Stats & Recent Bookings)
3. Manage Bookings (Accept/Reject)
4. View Schedule
5. Start Service
6. Enter Customer PIN to Complete
7. Manage Services (Add/Edit/Delete)

### Admin Flow
1. Login
2. View Dashboard (Platform Overview)
3. Approve/Reject Providers
4. Manage Locations
5. Manage Categories
6. Monitor All Bookings
7. View Analytics and Reports

## 📱 Responsive Design

The application is fully responsive with:
- Desktop-first approach (primary)
- Tablet optimization
- Mobile-friendly layouts
- Collapsible navigation menus
- Touch-friendly buttons and interactions
- Adaptive grid systems

## 🔧 Key Features

1. **Role-Based Access Control**: Three distinct user interfaces
2. **Real-time Status Updates**: Live booking status tracking
3. **PIN Verification System**: Secure service completion
4. **Rating & Review System**: Service quality feedback
5. **Search & Filtering**: Easy data discovery
6. **Interactive Charts**: Visual data representation
7. **Toast Notifications**: User feedback for all actions
8. **Form Validation**: Input validation with error messages
9. **Skeleton Loading**: Smooth loading experience
10. **Animation System**: Smooth transitions throughout

## 🎉 Getting Started

1. Open the application
2. You'll land on the welcome page
3. Click "Get Started" or "Sign Up"
4. Choose your role (Customer/Provider/Admin)
5. Login with any credentials
6. Explore the dashboard for your role!

## 🌟 Highlights

- **Fully Functional**: All features work without backend integration
- **Mock Data**: Realistic data for demonstration
- **Production Ready**: Clean code, proper structure, best practices
- **Accessible**: Built with Radix UI for accessibility
- **Modern UX**: Smooth animations and transitions
- **Comprehensive**: Complete implementation of all requirements
- **Professional Design**: Comparable to real-world SaaS platforms

## 📝 Notes

- This is a frontend-only application using mock data
- No backend or database connection required
- All data resets on page refresh
- Designed for demonstration and educational purposes
- Perfect for portfolios and project presentations
