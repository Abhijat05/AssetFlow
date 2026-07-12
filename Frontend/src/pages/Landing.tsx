import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import {
  ArrowRight,
  Sparkles,
  LayoutGrid,
  CheckCircle,
  Plus,
  Calendar,
  Wrench,
  ShieldCheck,
  BarChart3,
} from "lucide-react";
import heroImage from "../assets/dashboard_mockup.jpg";

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  // Interactive demo state: lists of sticky notes representing assets or ERP modules
  const [items, setItems] = useState([
    { id: "1", text: "MacBook Pro M3", cat: "Assets", col: "bg-[#e6f7f7] border-[#00a3a3]/30 text-[#004d4d]" },
    { id: "2", text: "Conference Room A", cat: "Bookings", col: "bg-[#fff0ed] border-[#ff7c65]/30 text-[#802313]" },
    { id: "3", text: "Server Room HVAC", cat: "Maintenance", col: "bg-[#ffd02f]/10 border-[#ffd02f]/40 text-[#050038]" },
    { id: "4", text: "Annual Audit Q3", cat: "Audits", col: "bg-[#f5f6fc] border-[#4262ff]/30 text-[#050038]" }
  ]);
  const [newItemText, setNewItemText] = useState("");
  const [filterCat, setFilterCat] = useState("ALL");

  const categories = ["ALL", "Assets", "Bookings", "Maintenance", "Audits"];

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    
    const randomColors = [
      { col: "bg-[#e6f7f7] border-[#00a3a3]/30 text-[#004d4d]", cat: "Assets" },
      { col: "bg-[#fff0ed] border-[#ff7c65]/30 text-[#802313]", cat: "Bookings" },
      { col: "bg-[#ffd02f]/10 border-[#ffd02f]/40 text-[#050038]", cat: "Maintenance" },
      { col: "bg-[#f5f6fc] border-[#4262ff]/30 text-[#050038]", cat: "Audits" }
    ];
    const pick = randomColors[Math.floor(Math.random() * randomColors.length)];

    setItems([
      ...items,
      {
        id: Date.now().toString(),
        text: newItemText,
        cat: pick.cat,
        col: pick.col
      }
    ]);
    setNewItemText("");
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const filteredItems = filterCat === "ALL" 
    ? items 
    : items.filter(item => item.cat === filterCat);

  return (
    <div className="min-h-screen bg-canvas flex flex-col text-ink selection:bg-[#ffd02f]/30">
      {/* Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-hairline bg-canvas/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ffd02f] text-primary shadow-sm font-black">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 text-[#050038]"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="font-bold -tracking-body text-ink flex items-center gap-2">
              AssetFlow <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#ffd02f]/20 text-[#806600] tracking-wider">ERP</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-slate-500">
            <a href="#features" className="hover:text-[#4262ff] transition-colors">ERP Modules</a>
            <a href="#whiteboard" className="hover:text-[#4262ff] transition-colors">Sandbox Sandbox</a>
            <a href="#usecases" className="hover:text-[#4262ff] transition-colors">Capabilities</a>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Button
                onClick={() => navigate("/dashboard")}
                className="bg-[#050038] hover:bg-[#050038]/90 text-white rounded-full font-bold text-xs px-5 h-9"
              >
                Enter ERP Console
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => navigate("/login")}
                  className="rounded-full border-slate-200 text-slate-700 font-bold text-xs px-5 h-9 bg-white"
                >
                  Log In
                </Button>
                <Button
                  onClick={() => navigate("/signup")}
                  className="bg-[#4262ff] hover:bg-[#4262ff]/90 text-white rounded-full font-bold text-xs px-5 h-9"
                >
                  Register
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center space-y-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#ffd02f]/10 text-[#806600] border border-[#ffd02f]/30">
            <Sparkles className="h-3.5 w-3.5 text-[#ffd02f] fill-[#ffd02f]" />
            Enterprise Asset & Resource ERP Suite
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold -tracking-heading-1 leading-tight text-[#050038] max-w-5xl animate-reveal">
            Streamlined control over your{" "}
            <span className="relative inline-block text-[#4262ff]">
              enterprise assets
              <svg className="absolute left-0 bottom-[-10px] w-full h-[14px] text-[#ffd02f] fill-none" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M 1 5 Q 25 1, 50 6 T 99 5 M 4 8 Q 30 4, 60 7 T 95 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </span>.
          </h1>

          <p className="text-lg sm:text-xl text-slate-500 max-w-3xl font-semibold leading-relaxed">
            AssetFlow integrates inventory tracking, resource reservations, maintenance schedules, and audit cycles with interactive report analytics, real-time logs, and notifications.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              onClick={() => navigate(isAuthenticated ? "/dashboard" : "/signup")}
              className="bg-[#050038] hover:bg-[#050038]/90 text-white rounded-full text-sm font-extrabold px-8 py-6 shadow-md h-12"
            >
              Enter ERP Console
            </Button>
            <a href="#whiteboard">
              <Button
                variant="outline"
                className="rounded-full border-slate-200 bg-white text-slate-700 text-sm font-extrabold px-8 py-6 hover:bg-slate-50 h-12"
              >
                View Sandbox Sandbox
              </Button>
            </a>
          </div>

          {/* Hero Banner Mockup */}
          <div className="relative pt-12 w-full max-w-5xl">
            {/* Custom Floating Styles */}
            <style>{`
              @keyframes float-left {
                0%, 100% { transform: translateY(0) rotate(-4deg); }
                50% { transform: translateY(-8px) rotate(-4deg); }
              }
              @keyframes float-right {
                0%, 100% { transform: translateY(0) rotate(6deg); }
                50% { transform: translateY(-8px) rotate(6deg); }
              }
              .animate-float-left {
                animation: float-left 4.5s ease-in-out infinite;
              }
              .animate-float-right {
                animation: float-right 5s ease-in-out infinite;
              }
            `}</style>

            {/* Visual hand-drawn connector arrow - Analytics Badge */}
            <div className="absolute -top-16 left-[5%] hidden lg:flex items-center gap-3 backdrop-blur-md bg-white/85 border border-[#4262ff]/20 p-2.5 rounded-2xl shadow-[0_12px_32px_rgba(66,98,255,0.08)] select-none animate-float-left transition-all duration-300 hover:scale-105 hover:border-[#4262ff]/40">
              <div className="h-8 w-8 rounded-xl bg-[#4262ff]/10 flex items-center justify-center text-[#4262ff] shrink-0">
                <BarChart3 className="h-4.5 w-4.5" />
              </div>
              <div className="text-left leading-none">
                <p className="text-[11px] font-extrabold text-[#050038] tracking-tight">Interactive Analytics</p>
                <p className="text-[9px] font-bold text-slate-400 mt-0.5">Live dashboards & charts</p>
              </div>
              
              <svg className="w-12 h-12 absolute -bottom-11 right-2 text-[#4262ff] opacity-50" viewBox="0 0 50 50" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M 15 5 C 25 15, 30 25, 20 45" strokeDasharray="3 3" />
                <path d="M 12 38 L 20 45 L 26 38" fill="none" />
              </svg>
            </div>

            {/* Another hand-drawn connector arrow on the right - Audit Badge */}
            <div className="absolute -top-20 right-[8%] hidden lg:flex items-center gap-3 backdrop-blur-md bg-white/85 border border-[#ff7c65]/20 p-2.5 rounded-2xl shadow-[0_12px_32px_rgba(255,124,101,0.08)] select-none animate-float-right transition-all duration-300 hover:scale-105 hover:border-[#ff7c65]/40">
              <div className="h-8 w-8 rounded-xl bg-[#ff7c65]/10 flex items-center justify-center text-[#ff7c65] shrink-0">
                <Wrench className="h-4.5 w-4.5 animate-pulse" />
              </div>
              <div className="text-left leading-none">
                <p className="text-[11px] font-extrabold text-[#802313] tracking-tight">Audit & Maintenance</p>
                <p className="text-[9px] font-bold text-slate-400 mt-0.5">Live reconciliation desk</p>
              </div>

              <svg className="w-12 h-12 absolute -bottom-11 left-2 text-[#ff7c65] opacity-50" viewBox="0 0 50 50" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M 35 5 C 25 15, 20 25, 30 45" strokeDasharray="3 3" />
                <path d="M 38 38 L 30 45 L 24 38" fill="none" />
              </svg>
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-canvas via-transparent to-transparent z-10 pointer-events-none" />
            <div className="rounded-2xl border-4 border-[#050038] shadow-[0_24px_64px_rgba(5,0,56,0.15)] overflow-hidden bg-white">
              <img
                src={heroImage}
                alt="AssetFlow Whiteboard Mockup"
                className="w-full h-auto object-cover transform hover:scale-[1.01] transition-transform duration-500"
              />
            </div>

            {/* Hand-placed decorative tags */}
            <div className="absolute top-[40%] -left-8 hidden md:block bg-[#ffd02f] text-primary font-black text-xs py-2.5 px-4 rounded-xl shadow-md rotate-[-6deg] hover:rotate-0 transition-transform duration-200">
              📊 Real-Time Charts
            </div>
            <div className="absolute bottom-[30%] -right-10 hidden md:block bg-[#e6f7f7] border border-[#00a3a3] text-[#004d4d] font-bold text-xs py-2 px-4 rounded-xl shadow-md rotate-[8deg] hover:rotate-0 transition-transform duration-200">
              🔔 Polling Notifications (Active)
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 border-t border-hairline bg-[#f5f6fc]/20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold -tracking-heading-2 text-[#050038]">
              Centralized Modules. Professional Control.
            </h2>
            <p className="text-slate-500 font-semibold">
              AssetFlow integrates visual planning and robust ERP execution parameters into a clean interface.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
            {/* Bookings */}
            <Card className="border-[#ff7c65]/30 bg-[#fff0ed] rounded-2xl rotate-[-0.5deg] hover:-rotate-1 hover:scale-[1.03] hover:shadow-[0_16px_48px_rgba(5,0,56,0.06)] transition-all duration-200">
              <CardContent className="p-8 space-y-4">
                <div className="h-10 w-10 rounded-xl bg-[#ff7c65]/20 flex items-center justify-center border border-[#ff7c65]/30">
                  <Calendar className="h-5 w-5 text-[#802313]" />
                </div>
                <h3 className="text-lg font-extrabold text-[#802313]">Allocations & Bookings</h3>
                <p className="text-xs text-[#802313]/90 leading-relaxed font-semibold">
                  Track active check-outs, schedule reservations, and oversee allocation logs. Emits real-time notification alerts when bookings are scheduled or cancelled.
                </p>
              </CardContent>
            </Card>

            {/* Audits */}
            <Card className="border-[#00a3a3]/30 bg-[#e6f7f7] rounded-2xl rotate-[1deg] hover:rotate-0 hover:scale-[1.03] hover:shadow-[0_16px_48px_rgba(5,0,56,0.06)] transition-all duration-200">
              <CardContent className="p-8 space-y-4">
                <div className="h-10 w-10 rounded-xl bg-[#00a3a3]/20 flex items-center justify-center border border-[#00a3a3]/30">
                  <ShieldCheck className="h-5 w-5 text-[#004d4d]" />
                </div>
                <h3 className="text-lg font-extrabold text-[#004d4d]">Audits & Reconciliation</h3>
                <p className="text-xs text-[#004d4d]/90 leading-relaxed font-semibold">
                  Schedule physical audit cycles, assign auditors, and reconcile discrepancies (Missing / Damaged). Updates unread discrepancy items and completion analytics automatically.
                </p>
              </CardContent>
            </Card>

            {/* Maintenance */}
            <Card className="border-[#ffd02f]/40 bg-[#ffd02f]/10 rounded-2xl rotate-[-0.5deg] hover:rotate-1 hover:scale-[1.03] hover:shadow-[0_16px_48px_rgba(5,0,56,0.06)] transition-all duration-200">
              <CardContent className="p-8 space-y-4">
                <div className="h-10 w-10 rounded-xl bg-[#ffd02f]/30 flex items-center justify-center border border-[#ffd02f]/40">
                  <Wrench className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-extrabold text-primary">Maintenance & Analytics</h3>
                <p className="text-xs text-primary/90 leading-relaxed font-semibold">
                  Log maintenance requests, dispatch technicians, and resolve tickets. Monitor overall metrics with utilization charts and peak hourly reservation heatmaps.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Interactive Sandbox Demo Section */}
      <section id="whiteboard" className="py-20 border-t border-hairline bg-canvas">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#4262ff]/10 text-[#4262ff] border border-[#4262ff]/20">
                <LayoutGrid className="h-3.5 w-3.5" />
                Live Asset Schema Sandbox
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold -tracking-heading-2 text-[#050038]">
                Test the Schema Sandbox in Real-Time
              </h2>
              <p className="text-slate-500 font-semibold">
                Create temporary resources and toggle filters to see how dynamically our visual canvas categorizes assets, bookings, maintenance, and audits.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setFilterCat(c)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                    filterCat === c
                      ? "bg-primary text-white border-primary shadow-sm"
                      : "border-hairline bg-white text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Whiteboard Grid */}
          <div className="p-8 rounded-2xl border border-slate-200 bg-white relative overflow-hidden min-h-[360px] shadow-[inset_0_2px_8px_rgba(5,0,56,0.03)]">
            {/* Faint whiteboard background grid */}
            <div className="absolute inset-0 pointer-events-none" style={{
              backgroundImage: "radial-gradient(rgba(5, 0, 56, 0.06) 1.5px, transparent 1.5px)",
              backgroundSize: "20px 20px"
            }} />

            {/* Creative SVG mindmap connection lines */}
            {filterCat === "ALL" && items.length >= 4 && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-[#4262ff]/20 fill-none hidden md:block z-0" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="6 6">
                <path d="M 180 150 C 280 200, 260 90, 360 150" />
                <path d="M 420 150 C 520 220, 500 80, 600 150" />
                <path d="M 660 150 C 760 210, 720 90, 820 150" />
                
                <path d="M 350 142 L 360 150 L 350 158" strokeWidth="2" stroke="#4262ff" />
                <path d="M 590 142 L 600 150 L 590 158" strokeWidth="2" stroke="#4262ff" />
                <path d="M 810 142 L 820 150 L 810 158" strokeWidth="2" stroke="#4262ff" />
              </svg>
            )}

            <form onSubmit={handleAddItem} className="relative z-10 flex gap-2 max-w-md mb-6">
              <input
                type="text"
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                placeholder="Type an item (e.g. iPad Pro, Conf Room A, Server HVAC)..."
                className="flex-1 h-9 px-3 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <Button
                type="submit"
                className="bg-primary hover:bg-primary-hover text-white rounded-full h-9 px-4 text-xs font-bold flex items-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Sticky
              </Button>
            </form>

            <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-6">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`p-5 rounded-xl border shadow-sm relative group flex flex-col justify-between min-h-[130px] transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-md cursor-pointer animate-reveal ${item.col}`}
                >
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="absolute top-2 right-2 h-5 w-5 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold"
                  >
                    ×
                  </button>
                  <p className="text-sm font-semibold tracking-tight leading-snug">{item.text}</p>
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-60 mt-4">{item.cat}</span>
                </div>
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center flex-col text-center p-6 pointer-events-none">
                <p className="text-sm font-semibold text-slate-400">No sticky notes match this category filter.</p>
                <p className="text-xs text-slate-400 mt-1">Use the input bar to add new resource stickies.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Trust & Use Cases */}
      <section id="usecases" className="py-20 border-t border-hairline bg-[#f5f6fc]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
          <div className="space-y-4 lg:col-span-1">
            <h2 className="text-3xl font-extrabold -tracking-heading-2 text-[#050038]">
              Engineered for Enterprise Scale
            </h2>
            <p className="text-slate-500 font-semibold leading-relaxed">
              We leverage strict validation schemas, real-time data syncs, and comprehensive audits to ensure asset integrity.
            </p>
            <div className="pt-2">
              <Button
                onClick={() => navigate("/signup")}
                className="bg-[#050038] hover:bg-[#050038]/90 text-white rounded-full font-bold text-xs px-6 h-9"
              >
                Create Workspace
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:col-span-2">
            <div className="flex gap-4">
              <div className="h-6 w-6 rounded-full bg-[#00a3a3]/10 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle className="h-4 w-4 text-[#00a3a3]" />
              </div>
              <div>
                <h4 className="font-extrabold text-[#050038] text-xs uppercase tracking-wider">Activity Audit Trails</h4>
                <p className="text-xs text-slate-500 leading-relaxed mt-1">
                  Trace actions, module triggers, ip addresses, and user operators securely in a centralized activity log.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="h-6 w-6 rounded-full bg-[#00a3a3]/10 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle className="h-4 w-4 text-[#00a3a3]" />
              </div>
              <div>
                <h4 className="font-extrabold text-[#050038] text-xs uppercase tracking-wider">TanStack Polling Inbox</h4>
                <p className="text-xs text-slate-500 leading-relaxed mt-1">
                  Automatically refresh unread counts and notifications in real time to coordinate asset assignees.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="h-6 w-6 rounded-full bg-[#00a3a3]/10 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle className="h-4 w-4 text-[#00a3a3]" />
              </div>
              <div>
                <h4 className="font-extrabold text-[#050038] text-xs uppercase tracking-wider">Interactive ERP Analytics</h4>
                <p className="text-xs text-slate-500 leading-relaxed mt-1">
                  Generate report status breakdowns, booking timeline areas, and export data directly to CSV, Excel, or PDF.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="h-6 w-6 rounded-full bg-[#00a3a3]/10 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle className="h-4 w-4 text-[#00a3a3]" />
              </div>
              <div>
                <h4 className="font-extrabold text-[#050038] text-xs uppercase tracking-wider">Granular Role Guards</h4>
                <p className="text-xs text-slate-500 leading-relaxed mt-1">
                  Dashboards and operations adjust dynamically based on roles (ADMIN, MANAGER, DEPT_HEAD, EMPLOYEE).
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-hairline bg-canvas">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#ffd02f] text-primary shadow-sm font-black">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3 w-3 text-[#050038]"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="font-bold -tracking-body text-[#050038] text-sm">
              AssetFlow
            </span>
          </div>

          <p className="text-xs text-slate-400 font-semibold">
            © {new Date().getFullYear()} AssetFlow Corp. Built under strict ERP specs. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
