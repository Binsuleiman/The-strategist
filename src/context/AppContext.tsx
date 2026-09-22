import React, { createContext, useContext, useState, useEffect } from "react";
import {
  FounderProfile,
  Idea,
  User,
} from "../types";

export type AppView =
  | "landing"
  | "onboarding"
  | "dashboard"
  | "discover"
  | "idea-detail"
  | "compare"
  | "saved"
  | "settings"
  | "auth";

export type IdeaDetailTab =
  | "overview"
  | "validation"
  | "competitors"
  | "stress-test"
  | "improve"
  | "business-model"
  | "mvp"
  | "action-plan";

interface ToastMessage {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message?: string;
}

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  founderProfile: FounderProfile;
  setFounderProfile: (profile: FounderProfile) => void;
  updateFounderProfile: (partial: Partial<FounderProfile>) => void;
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  ideas: Idea[];
  setIdeas: (ideas: Idea[]) => void;
  savedIdeas: Idea[];
  currentIdea: Idea | null;
  setCurrentIdea: (idea: Idea | null) => void;
  currentIdeaTab: IdeaDetailTab;
  setCurrentIdeaTab: (tab: IdeaDetailTab) => void;
  saveIdea: (idea: Idea) => void;
  unsaveIdea: (ideaId: string) => void;
  updateIdea: (updated: Idea) => void;
  deleteIdea: (ideaId: string) => void;
  updateIdeaStatus: (ideaId: string, status: Idea["status"]) => void;
  toggleActionTask: (ideaId: string, dayNum: number, taskId: string) => void;
  selectedForComparison: string[];
  toggleComparisonSelect: (ideaId: string) => void;
  clearComparisonSelect: () => void;
  openIdea: (idea: Idea, tab?: IdeaDetailTab) => void;
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, "id">) => void;
  removeToast: (id: string) => void;
  resetAllData: () => void;
}

const DEFAULT_PROFILE: FounderProfile = {
  skills: ["Product Design", "Full-Stack Dev", "Growth Marketing"],
  interests: ["AI Workflows", "B2B SaaS", "Automation", "Fintech"],
  budget: "$500 - $2,500",
  timeCommitment: "15-25 hrs/week (Part-Time)",
  targetMarket: "Global English / B2B Mid-Market",
  businessType: "SaaS",
  founderGoal: "Full-time business",
  riskTolerance: "Balanced",
  backgroundSummary: "Technical builder with a passion for high-leverage software automation.",
};

const DEFAULT_USER: User = {
  id: "user_founder_1",
  email: "founder@strategist.ai",
  name: "Alex Vance",
  createdAt: new Date().toISOString(),
  hasCompletedOnboarding: false,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. User state
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem("strategist_user");
      return saved ? JSON.parse(saved) : DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  });

  // 2. Founder profile
  const [founderProfile, setFounderProfile] = useState<FounderProfile>(() => {
    try {
      const saved = localStorage.getItem("strategist_profile");
      return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });

  // 3. Current active view
  const [currentView, setCurrentView] = useState<AppView>(() => {
    try {
      const savedUser = localStorage.getItem("strategist_user");
      if (savedUser) {
        const u = JSON.parse(savedUser);
        if (u?.hasCompletedOnboarding) return "dashboard";
      }
      return "landing";
    } catch {
      return "landing";
    }
  });

  // 4. Generated ideas batch
  const [ideas, setIdeas] = useState<Idea[]>(() => {
    try {
      const saved = localStorage.getItem("strategist_latest_ideas");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 5. Saved ideas list (persistent workspace)
  const [savedIdeas, setSavedIdeas] = useState<Idea[]>(() => {
    try {
      const saved = localStorage.getItem("strategist_saved_ideas");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 6. Currently selected idea & tab
  const [currentIdea, setCurrentIdea] = useState<Idea | null>(() => {
    try {
      const saved = localStorage.getItem("strategist_active_idea");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [currentIdeaTab, setCurrentIdeaTab] = useState<IdeaDetailTab>("overview");
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // LocalStorage sync effects
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem("strategist_user", JSON.stringify(user));
      } else {
        localStorage.removeItem("strategist_user");
      }
    } catch (e) {
      console.warn("Storage sync error:", e);
    }
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem("strategist_profile", JSON.stringify(founderProfile));
    } catch (e) {
      console.warn("Storage sync error:", e);
    }
  }, [founderProfile]);

  useEffect(() => {
    try {
      localStorage.setItem("strategist_latest_ideas", JSON.stringify(ideas));
    } catch (e) {
      console.warn("Storage sync error:", e);
    }
  }, [ideas]);

  useEffect(() => {
    try {
      localStorage.setItem("strategist_saved_ideas", JSON.stringify(savedIdeas));
    } catch (e) {
      console.warn("Storage sync error:", e);
    }
  }, [savedIdeas]);

  useEffect(() => {
    try {
      if (currentIdea) {
        localStorage.setItem("strategist_active_idea", JSON.stringify(currentIdea));
      } else {
        localStorage.removeItem("strategist_active_idea");
      }
    } catch (e) {
      console.warn("Storage sync error:", e);
    }
  }, [currentIdea]);

  const addToast = (toast: Omit<ToastMessage, "id">) => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    const newToast: ToastMessage = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const updateFounderProfile = (partial: Partial<FounderProfile>) => {
    setFounderProfile((prev) => ({ ...prev, ...partial }));
  };

  const saveIdea = (idea: Idea) => {
    const enriched = { ...idea, isSaved: true, savedAt: new Date().toISOString() };
    setSavedIdeas((prev) => {
      const exists = prev.some((i) => i.id === idea.id);
      if (exists) {
        return prev.map((i) => (i.id === idea.id ? enriched : i));
      }
      return [enriched, ...prev];
    });
    // Also update currentIdea if matching
    if (currentIdea?.id === idea.id) {
      setCurrentIdea(enriched);
    }
    // Also update generated ideas list
    setIdeas((prev) => prev.map((i) => (i.id === idea.id ? enriched : i)));
    addToast({
      type: "success",
      title: "Opportunity Saved",
      message: `${idea.name} added to your Strategy Workspace.`,
    });
  };

  const unsaveIdea = (ideaId: string) => {
    setSavedIdeas((prev) => prev.filter((i) => i.id !== ideaId));
    setIdeas((prev) =>
      prev.map((i) => (i.id === ideaId ? { ...i, isSaved: false } : i))
    );
    if (currentIdea?.id === ideaId) {
      setCurrentIdea((prev) => (prev ? { ...prev, isSaved: false } : null));
    }
    addToast({
      type: "info",
      title: "Idea Removed",
      message: "Removed from saved opportunities.",
    });
  };

  const updateIdea = (updated: Idea) => {
    if (currentIdea?.id === updated.id) {
      setCurrentIdea(updated);
    }
    setSavedIdeas((prev) =>
      prev.map((i) => (i.id === updated.id ? updated : i))
    );
    setIdeas((prev) =>
      prev.map((i) => (i.id === updated.id ? updated : i))
    );
  };

  const deleteIdea = (ideaId: string) => {
    setSavedIdeas((prev) => prev.filter((i) => i.id !== ideaId));
    setIdeas((prev) => prev.filter((i) => i.id !== ideaId));
    if (currentIdea?.id === ideaId) {
      setCurrentIdea(null);
      setCurrentView("dashboard");
    }
    setSelectedForComparison((prev) => prev.filter((id) => id !== ideaId));
    addToast({
      type: "info",
      title: "Opportunity Deleted",
      message: "Idea has been deleted from your workspace.",
    });
  };

  const updateIdeaStatus = (ideaId: string, status: Idea["status"]) => {
    const updater = (i: Idea) => (i.id === ideaId ? { ...i, status } : i);
    setSavedIdeas((prev) => prev.map(updater));
    setIdeas((prev) => prev.map(updater));
    if (currentIdea?.id === ideaId) {
      setCurrentIdea((prev) => (prev ? { ...prev, status } : null));
    }
    addToast({
      type: "success",
      title: "Status Updated",
      message: `Opportunity status moved to ${status}.`,
    });
  };

  const toggleActionTask = (ideaId: string, dayNum: number, taskId: string) => {
    const updateTasksInIdea = (idea: Idea): Idea => {
      if (idea.id !== ideaId || !idea.actionPlan) return idea;
      const updatedDays = idea.actionPlan.days.map((day) => {
        if (day.day !== dayNum) return day;
        const updatedTasks = day.tasks.map((task) =>
          task.id === taskId ? { ...task, done: !task.done } : task
        );
        return { ...day, tasks: updatedTasks };
      });
      return { ...idea, actionPlan: { ...idea.actionPlan, days: updatedDays } };
    };

    if (currentIdea?.id === ideaId) {
      setCurrentIdea(updateTasksInIdea(currentIdea));
    }
    setSavedIdeas((prev) => prev.map(updateTasksInIdea));
    setIdeas((prev) => prev.map(updateTasksInIdea));
  };

  const toggleComparisonSelect = (ideaId: string) => {
    setSelectedForComparison((prev) => {
      if (prev.includes(ideaId)) {
        return prev.filter((id) => id !== ideaId);
      }
      if (prev.length >= 5) {
        addToast({
          type: "warning",
          title: "Limit Reached",
          message: "You can compare up to 5 opportunities simultaneously.",
        });
        return prev;
      }
      return [...prev, ideaId];
    });
  };

  const clearComparisonSelect = () => {
    setSelectedForComparison([]);
  };

  const openIdea = (idea: Idea, tab: IdeaDetailTab = "overview") => {
    setCurrentIdea(idea);
    setCurrentIdeaTab(tab);
    setCurrentView("idea-detail");
  };

  const resetAllData = () => {
    localStorage.clear();
    setUser(DEFAULT_USER);
    setFounderProfile(DEFAULT_PROFILE);
    setIdeas([]);
    setSavedIdeas([]);
    setCurrentIdea(null);
    setSelectedForComparison([]);
    setCurrentView("landing");
    addToast({
      type: "info",
      title: "Workspace Reset",
      message: "Data has been reset to defaults.",
    });
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        founderProfile,
        setFounderProfile,
        updateFounderProfile,
        currentView,
        setCurrentView,
        ideas,
        setIdeas,
        savedIdeas,
        currentIdea,
        setCurrentIdea,
        currentIdeaTab,
        setCurrentIdeaTab,
        saveIdea,
        unsaveIdea,
        updateIdea,
        deleteIdea,
        updateIdeaStatus,
        toggleActionTask,
        selectedForComparison,
        toggleComparisonSelect,
        clearComparisonSelect,
        openIdea,
        toasts,
        addToast,
        removeToast,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
