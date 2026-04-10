import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FileText, BarChart2, BarChart3, LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import "./sidebar.css";

const Sidebar = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const role      = localStorage.getItem("userRole");
  const username  = localStorage.getItem("username") || "User";
  const isAdmin   = role === "admin";
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");
    localStorage.removeItem("username");
    navigate("/");
  };

  const navItems = [
    { label: "Dashboard",      icon: <LayoutDashboard size={17}/>, path: "/dashboard",     adminOnly: true  },
    { label: "Daily Report",   icon: <BarChart2 size={17}/>,       path: "/daily-report",  adminOnly: false },
    { label: "Monthly Report", icon: <BarChart3 size={17}/>,       path: "/monthly-report",adminOnly: true  },
    { label: "Invoice Entry",  icon: <FileText size={17}/>,        path: "/invoice",       adminOnly: false },
  ];

  const handleNav = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  return (
    <>
      {/* ── Mobile top bar ── */}
      <div className="mobile-topbar">
        <div className="mobile-brand">
          <img src="/logo.png" alt="logo" className="mobile-logo" />
          <span>IMAGE OFFICE</span>
        </div>
        <button className="mobile-hamburger" onClick={() => setMobileOpen(true)} aria-label="Open menu">
          <Menu size={22} />
        </button>
      </div>

      {/* ── Overlay ── */}
      {mobileOpen && <div className="sb-overlay" onClick={() => setMobileOpen(false)} />}

      {/* ── Sidebar panel ── */}
      <div className={`sidebar ${mobileOpen ? "mobile-open" : ""}`}>

        {/* Close button (mobile only) */}
        <button className="sb-close-btn" onClick={() => setMobileOpen(false)} aria-label="Close menu">
          <X size={20} />
        </button>

        <div className="sb-brand">
          <img src="/logo.png" alt="logo" className="sb-logo" />
          <span>IMAGE OFFICE</span>
        </div>

        <div className={`sb-role-badge ${isAdmin ? "admin" : "staff"}`}>
          {isAdmin ? "👑 Admin" : "👤 Staff"} — {username}
        </div>

        <nav className="sb-nav">
          {navItems
            .filter((item) => !item.adminOnly || isAdmin)
            .map((item) => (
              <button key={item.path}
                className={`sb-btn ${location.pathname === item.path ? "active" : ""}`}
                onClick={() => handleNav(item.path)}>
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
        </nav>

        <button className="sb-btn sb-logout" onClick={handleLogout}>
          <LogOut size={17} />
          <span>Logout</span>
        </button>
      </div>
    </>
  );
};

export default Sidebar;