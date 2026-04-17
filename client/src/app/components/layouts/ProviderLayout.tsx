import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { LayoutDashboard, Calendar, Package, Settings, HelpCircle, LogOut, Menu, ChevronRight, Clock, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "../ui/ThemeToggle";
import { NotificationDropdown } from "../ui/NotificationDropdown";
import { InstallButton } from "../ui/InstallButton";
import { LanguageSwitcher } from "../ui/LanguageSwitcher";
import { useTranslation } from "react-i18next";

export function ProviderLayout() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Removed Availability from navItems
  const navItems = [
    { path: "/provider", label: t("dashboard"), icon: LayoutDashboard, exact: true },
    { path: "/provider/bookings", label: t("active_bookings"), icon: Calendar },
    { path: "/provider/schedule", label: t("schedule"), icon: Clock },
    { path: "/provider/availability", label: "Availability", icon: Calendar },
    { path: "/provider/services", label: t("my_services") || "My Services", icon: Package },
    { path: "/provider/help", label: t("help"), icon: HelpCircle },
    { path: "/provider/profile", label: t("profile_settings") || "Profile Settings", icon: Settings },
  ];

  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/login");
  };

  const isActive = (item: any) =>
    item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);

  return (
    <div className="min-h-screen bg-background font-sans flex">
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        animate={{ width: collapsed ? 72 : 256 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:flex flex-col h-screen sticky top-0 border-r bg-card/50 backdrop-blur-xl overflow-hidden shrink-0"
      >
        <SidebarInner
          navItems={navItems} collapsed={collapsed} setCollapsed={setCollapsed}
          isActive={isActive} handleLogout={handleLogout} userInfo={userInfo}
          brand="CityServe Pro" brandColor="from-emerald-600 to-primary"
        />
      </motion.aside>

      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-0 top-0 bottom-0 w-64 z-50 flex flex-col bg-card border-r shadow-2xl lg:hidden"
          >
            <SidebarInner
              navItems={navItems} collapsed={false} setCollapsed={() => {}}
              isActive={isActive} handleLogout={handleLogout} userInfo={userInfo}
              brand="CityServe Pro" brandColor="from-emerald-600 to-primary"
              onNavClick={() => setMobileOpen(false)}
            />
          </motion.aside>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-16 border-b bg-background/80 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-secondary">
            <Menu className="size-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <InstallButton className="hidden sm:flex" />
            <LanguageSwitcher />
            <NotificationDropdown />
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function SidebarInner({ navItems, collapsed, setCollapsed, isActive, handleLogout, userInfo, brand, brandColor, onNavClick }: any) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between h-16 px-4 border-b shrink-0">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
              className={`text-xl font-heading font-black bg-gradient-to-r ${brandColor} bg-clip-text text-transparent truncate`}>
              {brand}
            </motion.span>
          )}
        </AnimatePresence>
        <button onClick={() => setCollapsed(!collapsed)} className="p-2 rounded-xl hover:bg-secondary transition-colors hidden lg:flex">
          <ChevronRight className={`size-4 transition-transform duration-300 ${collapsed ? "rotate-0" : "rotate-180"}`} />
        </button>
      </div>

      {!collapsed && (
        <div className="px-4 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-emerald-500/10 text-emerald-600 font-black flex items-center justify-center text-sm shrink-0">
              {userInfo?.name?.charAt(0)?.toUpperCase() || "P"}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm truncate">{userInfo?.name || "Provider"}</p>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Service Expert</span>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item: any) => {
          const Icon = item.icon;
          const active = isActive(item);
          return (
            <Link key={item.path} to={item.path} onClick={onNavClick}>
              <motion.div whileHover={{ x: 2 }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
                  active ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                }`}>
                <Icon className="size-5 shrink-0" />
                <AnimatePresence mode="wait">
                  {!collapsed && (
                    <motion.span initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-sm font-bold truncate">
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="p-2 border-t shrink-0">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all">
          <LogOut className="size-5 shrink-0" />
          <AnimatePresence mode="wait">
            {!collapsed && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm font-bold">{t("logout")}</motion.span>}
          </AnimatePresence>
        </button>
      </div>
    </div>
  );
}
