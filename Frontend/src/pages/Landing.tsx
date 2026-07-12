import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import {
  ArrowRight,
  Shield,
  Briefcase,
  Building,
  Sparkles,
  LayoutGrid,
  CheckCircle,
  Plus
} from "lucide-react";
import heroImage from "../assets/dashboard_mockup.jpg";

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  // Interactive demo state: lists of sticky notes representing assets or departments
  const [items, setItems] = useState([
    { id: "1", text: "HQ Servers", cat: "Infrastructure", col: "bg-[#e6f7f7] border-[#00a3a3]/30 text-[#004d4d]" },
    { id: "2", text: "Design Team", cat: "Department Head", col: "bg-[#fff0ed] border-[#ff7c65]/30 text-[#802313]" },
    { id: "3", text: "Vaporizer A", cat: "Production", col: "bg-[#ffd02f]/10 border-[#ffd02f]/40 text-[#050038]" },
    { id: "4", text: "Security Key", cat: "Security", col: "bg-[#f5f6fc] border-[#4262ff]/30 text-[#050038]" }
  ]);
  const [newItemText, setNewItemText] = useState("");
  const [filterCat, setFilterCat] = useState("ALL");

  const categories = ["ALL", "Infrastructure", "Department Head", "Production", "Security"];

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    
    const randomColors = [
      { col: "bg-[#e6f7f7] border-[#00a3a3]/30 text-[#004d4d]", cat: "Infrastructure" },
      { col: "bg-[#fff0ed] border-[#ff7c65]/30 text-[#802313]", cat: "Department Head" },
      { col: "bg-[#ffd02f]/10 border-[#ffd02f]/40 text-[#050038]", cat: "Production" },
      { col: "bg-[#f5f6fc] border-[#4262ff]/30 text-[#050038]", cat: "Security" }
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
    <div className="min-h-screen bg-canvas flex flex-col text-ink selection:bg-brand-yellow/30">
      {/* Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-hairline bg-canvas/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-yellow text-primary shadow-sm font-black">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="font-bold -tracking-body text-ink">
              AssetFlow <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-yellow/20 text-[#806600]">BETA</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
            <a href="#features" className="text-ink-subtle hover:text-ink transition-colors">Features</a>
            <a href="#whiteboard" className="text-ink-subtle hover:text-ink transition-colors">Interactive Demo</a>
            <a href="#usecases" className="text-ink-subtle hover:text-ink transition-colors">Enterprise Use</a>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Button
                onClick={() => navigate("/dashboard")}
                className="bg-primary hover:bg-primary-hover text-white rounded-full font-semibold px-5"
              >
                Go to Console
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => navigate("/login")}
                  className="rounded-full border-hairline text-ink font-semibold px-5"
                >
                  Log In
                </Button>
                <Button
                  onClick={() => navigate("/signup")}
                  className="bg-primary hover:bg-primary-hover text-white rounded-full font-semibold px-5"
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
            <Sparkles className="h-3.5 w-3.5 text-brand-yellow fill-brand-yellow" />
            Enterprise Asset & Resource ERP System
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold -tracking-heading-1 leading-tight text-ink max-w-5xl animate-reveal">
            Visual control over your{" "}
            <span className="relative inline-block">
              enterprise assets
              <svg className="absolute left-0 bottom-[-10px] w-full h-[14px] text-brand-yellow fill-none" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M 1 5 Q 25 1, 50 6 T 99 5 M 4 8 Q 30 4, 60 7 T 95 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </span>.
          </h1>

          <p className="text-lg sm:text-xl text-ink-subtle max-w-2xl font-medium leading-relaxed">
            AssetFlow brings canvas-like design flexibility to resource inventory. Plan departments, structure equipment categories, and manage employee directories in one unified console.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              onClick={() => navigate(isAuthenticated ? "/dashboard" : "/signup")}
              className="bg-primary hover:bg-primary-hover text-white rounded-full text-base font-semibold px-8 py-6 shadow-md"
            >
              Enter System Console
            </Button>
            <a href="#whiteboard">
              <Button
                variant="outline"
                className="rounded-full border-hairline bg-canvas text-ink text-base font-semibold px-8 py-6 hover:bg-surface-2"
              >
                View Sandbox Demo
              </Button>
            </a>
          </div>

          {/* Hero Banner Mockup */}
          <div className="relative pt-12 w-full max-w-5xl">
            {/* Visual hand-drawn connector arrow */}
            <div className="absolute -top-6 left-[12%] hidden lg:flex flex-col items-center gap-1 text-brand-blue select-none">
              <span className="text-[11px] font-bold font-mono tracking-wider bg-[#4262ff]/10 text-brand-blue px-2.5 py-1 rounded-full rotate-[-4deg] border border-[#4262ff]/20 shadow-sm">
                Visual Hierarchy & ERP Console
              </span>
              <svg className="w-10 h-10 transform -rotate-12 text-brand-blue" viewBox="0 0 50 50" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M 10 10 C 25 10, 30 25, 35 40" strokeDasharray="3 3" />
                <path d="M 28 35 L 35 40 L 40 33" fill="none" />
              </svg>
            </div>

            {/* Another hand-drawn connector arrow on the right pointing to tags */}
            <div className="absolute -top-10 right-[15%] hidden lg:flex flex-col items-center gap-1 text-[#ff7c65] select-none">
              <svg className="w-10 h-10 transform rotate-12 text-[#ff7c65]" viewBox="0 0 50 50" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M 40 10 C 25 10, 20 25, 15 40" strokeDasharray="3 3" />
                <path d="M 22 35 L 15 40 L 10 33" fill="none" />
              </svg>
              <span className="text-[11px] font-bold font-mono tracking-wider bg-[#fff0ed] text-[#802313] px-2.5 py-1 rounded-full rotate-[6deg] border border-[#ff7c65]/30 shadow-sm">
                Interactive Asset Blueprint
              </span>
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-canvas via-transparent to-transparent z-10 pointer-events-none" />
            <div className="rounded-2xl border-4 border-[#050038] shadow-[0_24px_64px_rgba(5,0,56,0.15)] overflow-hidden bg-surface-1">
              <img
                src={heroImage}
                alt="AssetFlow Whiteboard Mockup"
                className="w-full h-auto object-cover transform hover:scale-[1.01] transition-transform duration-500"
              />
            </div>

            {/* Hand-placed decorative tags */}
            <div className="absolute top-[40%] -left-8 hidden md:block bg-[#ffd02f] text-primary font-bold text-xs py-2 px-4 rounded-md shadow-md rotate-[-6deg] hover:rotate-0 transition-transform duration-200">
              📌 Design Category
            </div>
            <div className="absolute bottom-[30%] -right-10 hidden md:block bg-[#e6f7f7] border border-[#00a3a3] text-[#004d4d] font-bold text-xs py-2 px-4 rounded-md shadow-md rotate-[8deg] hover:rotate-0 transition-transform duration-200">
              ⚡ ACTIVE (124 items)
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 border-t border-hairline bg-surface-2/30 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-semibold -tracking-heading-2 text-ink">
              whiteboard flexibility. enterprise control.
            </h2>
            <p className="text-ink-subtle font-medium">
              We ditched standard rigid database spreadsheets. Build and restructure your organizational blueprint dynamically.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
            {/* Dept Mapping */}
            <Card className="border-[#ff7c65]/30 bg-[#fff0ed] rounded-xl rotate-[-0.5deg] hover:-rotate-1 hover:scale-[1.03] hover:shadow-[0_16px_48px_rgba(5,0,56,0.06)] transition-all duration-200">
              <CardContent className="p-8 space-y-4">
                <div className="h-10 w-10 rounded-full bg-[#ff7c65]/20 flex items-center justify-center">
                  <Building className="h-5 w-5 text-[#802313]" />
                </div>
                <h3 className="text-xl font-bold text-[#802313]">Visual Departments</h3>
                <p className="text-sm text-[#802313]/90 leading-relaxed font-medium">
                  Map organizations visually. Set parent-child hierarchy linkages, establish operational structures, and link department heads seamlessly in real-time.
                </p>
              </CardContent>
            </Card>

            {/* Custom Attributes */}
            <Card className="border-[#00a3a3]/30 bg-[#e6f7f7]/60 rounded-xl rotate-[1deg] hover:rotate-0 hover:scale-[1.03] hover:shadow-[0_16px_48px_rgba(5,0,56,0.06)] transition-all duration-200">
              <CardContent className="p-8 space-y-4">
                <div className="h-10 w-10 rounded-full bg-[#00a3a3]/20 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-[#004d4d]" />
                </div>
                <h3 className="text-xl font-bold text-[#004d4d]">Dynamic Category Fields</h3>
                <p className="text-sm text-[#004d4d]/90 leading-relaxed font-medium">
                  Create custom blueprints for any asset class. Define required properties (serial codes, numeric ranges, text options) dynamically on a per-category basis.
                </p>
              </CardContent>
            </Card>

            {/* RBAC controls */}
            <Card className="border-[#ffd02f]/40 bg-[#ffd02f]/10 rounded-xl rotate-[-0.5deg] hover:rotate-1 hover:scale-[1.03] hover:shadow-[0_16px_48px_rgba(5,0,56,0.06)] transition-all duration-200">
              <CardContent className="p-8 space-y-4">
                <div className="h-10 w-10 rounded-full bg-[#ffd02f]/30 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-primary">Granular RBAC Mappings</h3>
                <p className="text-sm text-primary/90 leading-relaxed font-medium">
                  Verify and secure administrative access. Manage staff roles, filter status updates, and assign managers to departments with fail-safe self-modification locks.
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
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#4262ff]/10 text-brand-blue border border-[#4262ff]/20">
                <LayoutGrid className="h-3.5 w-3.5" />
                Live Asset Schema Sandbox
              </div>
              <h2 className="text-3xl sm:text-4xl font-semibold -tracking-heading-2 text-ink">
                Test the Schema Sandbox in Real-Time
              </h2>
              <p className="text-ink-subtle font-medium">
                Create temporary resources and toggle filters to see how dynamically our visual canvas categorizes assets and organizational nodes.
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
                      : "border-hairline bg-canvas text-ink-subtle hover:bg-surface-2"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Whiteboard Grid */}
          <div className="p-8 rounded-2xl border border-hairline-strong bg-canvas relative overflow-hidden min-h-[360px] shadow-[inset_0_2px_8px_rgba(5,0,56,0.03)]">
            {/* Faint whiteboard background grid */}
            <div className="absolute inset-0 pointer-events-none bg-canvas" style={{
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
                placeholder="Type a resource name (e.g. iPad Pro, Server Rack)..."
                className="flex-1 h-9 px-3 text-xs bg-canvas border border-hairline rounded-md text-ink focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <Button
                type="submit"
                className="bg-primary hover:bg-primary-hover text-white rounded-full h-9 px-4 text-xs font-semibold flex items-center gap-1.5"
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
                <p className="text-sm font-semibold text-ink-subtle">No sticky notes match this category filter.</p>
                <p className="text-xs text-ink-muted mt-1">Use the input bar to add new resource stickies.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Trust & Use Cases */}
      <section id="usecases" className="py-20 border-t border-hairline bg-[#f5f6fc]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
          <div className="space-y-4 lg:col-span-1">
            <h2 className="text-3xl font-semibold -tracking-heading-2 text-ink">
              Engineered for strict operations
            </h2>
            <p className="text-ink-subtle font-medium leading-relaxed">
              Whiteboard layouts are backed by rigid validation schemas, audit trails, and strict constraint policies.
            </p>
            <div className="pt-2">
              <Button
                onClick={() => navigate("/signup")}
                className="bg-primary hover:bg-primary-hover text-white rounded-full font-semibold px-6"
              >
                Build your workspace
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:col-span-2">
            <div className="flex gap-4">
              <div className="h-6 w-6 rounded-full bg-[#00a3a3]/10 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle className="h-4 w-4 text-[#00a3a3]" />
              </div>
              <div>
                <h4 className="font-bold text-ink text-sm">Dynamic Schema Engine</h4>
                <p className="text-xs text-ink-subtle leading-relaxed mt-1">
                  Inputs match custom field validation schemas automatically, keeping inventory values clean and parsed.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="h-6 w-6 rounded-full bg-[#00a3a3]/10 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle className="h-4 w-4 text-[#00a3a3]" />
              </div>
              <div>
                <h4 className="font-bold text-ink text-sm">Real-time Directory Sync</h4>
                <p className="text-xs text-ink-subtle leading-relaxed mt-1">
                  Updates to employee departments, status indicators, and administrative rights propagate to access filters instantly.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="h-6 w-6 rounded-full bg-[#00a3a3]/10 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle className="h-4 w-4 text-[#00a3a3]" />
              </div>
              <div>
                <h4 className="font-bold text-ink text-sm">Role Fail-Safes</h4>
                <p className="text-xs text-ink-subtle leading-relaxed mt-1">
                  Prevent administrative locking. The platform blocks users from self-downgrading their roles or locking out directories.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="h-6 w-6 rounded-full bg-[#00a3a3]/10 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle className="h-4 w-4 text-[#00a3a3]" />
              </div>
              <div>
                <h4 className="font-bold text-ink text-sm">Flexible Hierarchy Trees</h4>
                <p className="text-xs text-ink-subtle leading-relaxed mt-1">
                  Organize branches logically. Select parent department links or leave items unassigned without breaks.
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
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-yellow text-primary shadow-sm font-black">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3 w-3"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="font-bold -tracking-body text-ink text-sm">
              AssetFlow
            </span>
          </div>

          <p className="text-xs text-ink-muted font-medium">
            © {new Date().getFullYear()} AssetFlow Corp. Built under the Miro Visual Design Specification system. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
