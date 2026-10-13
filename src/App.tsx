import React, { useState, useEffect } from "react";
import { ViewState, TypingStats, Lesson } from "./types";
import { Dashboard } from "./components/Dashboard";
import { Lessons } from "./components/Lessons";
import { Practice } from "./components/Practice";
import { GamesMenu } from "./components/Games/GamesMenu";
import { Reports } from "./components/Reports";
import { LessonDesigner } from "./components/LessonDesigner";
import {
  Keyboard,
  Home,
  BookOpen,
  Gamepad2,
  BarChart3,
  Edit3,
  Menu,
  X,
} from "lucide-react";

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>("dashboard");
  const [stats, setStats] = useState<TypingStats[]>([]);
  const [customLessons, setCustomLessons] = useState<Lesson[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedStats = localStorage.getItem("typeMasterStats");
    if (savedStats) {
      try {
        setStats(JSON.parse(savedStats));
      } catch (e) {
        console.error("Failed to parse stats", e);
      }
    }

    const savedLessons = localStorage.getItem("typeMasterLessons");
    if (savedLessons) {
      try {
        setCustomLessons(JSON.parse(savedLessons));
      } catch (e) {
        console.error("Failed to parse lessons", e);
      }
    }
  }, []);

  // Save stats whenever they change
  useEffect(() => {
    localStorage.setItem("typeMasterStats", JSON.stringify(stats));
  }, [stats]);

  // Save lessons whenever they change
  useEffect(() => {
    localStorage.setItem("typeMasterLessons", JSON.stringify(customLessons));
  }, [customLessons]);

  const handleSaveStats = (newStat: Omit<TypingStats, "id">) => {
    const statWithId: TypingStats = {
      ...newStat,
      id: `stat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    setStats((prev) => [...prev, statWithId]);
  };

  const handleSaveLesson = (lesson: Lesson) => {
    setCustomLessons((prev) => [...prev, lesson]);
  };

  const handleDeleteLesson = (id: string) => {
    setCustomLessons((prev) => prev.filter((l) => l.id !== id));
  };

  const renderView = () => {
    switch (currentView) {
      case "dashboard":
        return <Dashboard onChangeView={setCurrentView} stats={stats} />;
      case "lessons":
        return <Lessons onSaveStats={handleSaveStats} />;
      case "practice":
        return <Practice onSaveStats={handleSaveStats} />;
      case "games":
        return <GamesMenu onSaveStats={handleSaveStats} />;
      case "reports":
        return <Reports stats={stats} />;
      case "designer":
        return (
          <LessonDesigner
            customLessons={customLessons}
            onSaveLesson={handleSaveLesson}
            onDeleteLesson={handleDeleteLesson}
          />
        );
      default:
        return <Dashboard onChangeView={setCurrentView} stats={stats} />;
    }
  };

  const NavItem = ({
    view,
    icon: Icon,
    label,
  }: {
    view: ViewState;
    icon: any;
    label: string;
  }) => {
    const isActive = currentView === view;
    return (
      <button
        onClick={() => {
          setCurrentView(view);
          setIsMobileMenuOpen(false);
        }}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full ${
          isActive
            ? "bg-indigo-50 text-indigo-700 font-semibold"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        }`}
      >
        <Icon
          size={20}
          className={isActive ? "text-indigo-600" : "text-slate-400"}
        />
        <span>{label}</span>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
            <Keyboard size={20} />
          </div>
          <span className="text-lg font-bold text-slate-800 tracking-tight">TypeMaster</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/20 z-30 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full z-40 transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <div className="bg-indigo-600 p-2 rounded-lg text-white">
            <Keyboard size={24} />
          </div>
          <span className="text-xl font-bold text-slate-800 tracking-tight">
            TypeMaster
          </span>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto">
          <NavItem view="dashboard" icon={Home} label="Dashboard" />
          <NavItem view="lessons" icon={BookOpen} label="Lessons" />
          <NavItem view="practice" icon={Keyboard} label="Practice" />
          <NavItem view="games" icon={Gamepad2} label="Games" />
          <NavItem view="reports" icon={BarChart3} label="Reports" />

          <div className="mt-8 mb-2 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Instructor Tools
          </div>
          <NavItem view="designer" icon={Edit3} label="Lesson Designer" />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <p className="text-xs text-slate-500 text-center">
              Practice daily for best results. Aim for 95%+ accuracy before
              focusing on speed.
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-4 md:p-8 overflow-y-auto pt-20 lg:pt-8 h-screen">
        <div className="max-w-6xl mx-auto">{renderView()}</div>
      </main>
    </div>
  );
}
