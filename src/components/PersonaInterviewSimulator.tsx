import React, { useState, useEffect, useRef } from "react";
import {
  Users,
  MessageSquare,
  Sparkles,
  Send,
  RefreshCw,
  Award,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Briefcase,
  DollarSign,
  ShieldAlert,
  Save,
  HelpCircle,
} from "lucide-react";
import { Idea, PersonaProfile, InterviewMessage, InterviewSimulationSession } from "../types";
import { generatePersonasApi, simulateInterviewReplyApi } from "../services/api";
import { useApp } from "../context/AppContext";

interface PersonaInterviewSimulatorProps {
  idea: Idea;
  onUpdateIdea: (updated: Idea) => void;
}

const DEFAULT_PROMPTS = [
  "What is your biggest daily frustration with your current process?",
  "How much do you currently spend on tools or workarounds for this?",
  "If our tool solved this in 1-click, what would stop you from buying it today?",
  "Would a pricing of $99/month make sense for your team's budget?",
  "What proof or compliance requirement do you need before signing off?",
];

export const PersonaInterviewSimulator: React.FC<PersonaInterviewSimulatorProps> = ({
  idea,
  onUpdateIdea,
}) => {
  const { addToast } = useApp();
  const [personas, setPersonas] = useState<PersonaProfile[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<PersonaProfile | null>(null);
  const [isLoadingPersonas, setIsLoadingPersonas] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Load existing sessions or generate initial personas
  useEffect(() => {
    if (personas.length === 0) {
      loadPersonas();
    }
  }, [idea.id]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isReplying]);

  const loadPersonas = async () => {
    setIsLoadingPersonas(true);
    try {
      const res = await generatePersonasApi(idea);
      setPersonas(res.personas);
      if (res.personas.length > 0) {
        setSelectedPersona(res.personas[0]);
        initConversation(res.personas[0]);
      }
    } catch (err: any) {
      addToast({
        type: "error",
        title: "Persona Generation Failed",
        message: err.message || "Failed to generate customer personas.",
      });
    } finally {
      setIsLoadingPersonas(false);
    }
  };

  const initConversation = (persona: PersonaProfile) => {
    const existingSession = idea.interviewSessions?.find(
      (s) => s.persona.id === persona.id
    );
    if (existingSession && existingSession.messages.length > 0) {
      setMessages(existingSession.messages);
    } else {
      // Starting initial opener from persona
      const initialGreeting: InterviewMessage = {
        id: `msg_${Date.now()}_init`,
        sender: "persona",
        text: `Hi! Thanks for reaching out. I'm ${persona.name}, ${persona.role} at ${persona.companyType}. Our main headache right now is ${persona.corePain} Tell me what you're working on.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        sentiment: "neutral",
        buyIntentScore: 40,
        keyTakeaway: "Open to discussing pain points.",
      };
      setMessages([initialGreeting]);
    }
  };

  const handleSelectPersona = (persona: PersonaProfile) => {
    setSelectedPersona(persona);
    initConversation(persona);
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || !selectedPersona || isReplying) return;

    const userMsg: InterviewMessage = {
      id: `msg_${Date.now()}_user`,
      sender: "founder",
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputMessage("");
    setIsReplying(true);

    try {
      const res = await simulateInterviewReplyApi(
        idea,
        selectedPersona,
        newHistory,
        textToSend.trim()
      );

      const aiMsg: InterviewMessage = {
        id: `msg_${Date.now()}_ai`,
        sender: "persona",
        text: res.simulation.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        sentiment: res.simulation.sentiment,
        buyIntentScore: res.simulation.buyIntentScore,
        keyTakeaway: res.simulation.keyTakeaway,
      };

      const finalMessages = [...newHistory, aiMsg];
      setMessages(finalMessages);

      // Auto save interview session to idea
      saveSessionToIdea(selectedPersona, finalMessages);
    } catch (err: any) {
      addToast({
        type: "error",
        title: "Simulation Error",
        message: err.message || "Failed to simulate persona response.",
      });
    } finally {
      setIsReplying(false);
    }
  };

  const saveSessionToIdea = (persona: PersonaProfile, currentMessages: InterviewMessage[]) => {
    const aiReplies = currentMessages.filter((m) => m.sender === "persona" && m.buyIntentScore !== undefined);
    const avgScore =
      aiReplies.length > 0
        ? Math.round(
            aiReplies.reduce((acc, curr) => acc + (curr.buyIntentScore || 50), 0) / aiReplies.length
          )
        : 50;

    const takeaways = aiReplies
      .map((m) => m.keyTakeaway)
      .filter((t): t is string => Boolean(t));

    const newSession: InterviewSimulationSession = {
      persona,
      messages: currentMessages,
      overallSummary: {
        buyIntentScore: avgScore,
        topObjections: [persona.mainSkepticism],
        whatResonated: takeaways.slice(-2),
        priceSensitivityVerdict:
          avgScore > 70
            ? "High willingness to pay if promise is kept"
            : avgScore > 45
            ? "Moderate sensitivity; requires pilot/free trial"
            : "High friction; wants concrete proof and lower price",
        suggestedPitchTweak: `Focus pitch directly on eliminating '${persona.currentWorkaround}' with zero onboarding lag.`,
      },
      completedAt: new Date().toISOString(),
    };

    const existingSessions = idea.interviewSessions || [];
    const filtered = existingSessions.filter((s) => s.persona.id !== persona.id);
    const updatedIdea: Idea = {
      ...idea,
      interviewSessions: [...filtered, newSession],
    };

    onUpdateIdea(updatedIdea);
  };

  const activeSession = idea.interviewSessions?.find(
    (s) => s.persona.id === selectedPersona?.id
  );
  const latestAiMessage = [...messages].reverse().find((m) => m.sender === "persona" && m.buyIntentScore);

  return (
    <div id="customer-persona-simulator-section" className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-[#121215] border border-[#27272A] rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono-code font-bold uppercase tracking-wider bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                CUSTOMER DISCOVERY LAB
              </span>
              <span className="text-xs font-mono-code text-[#71717A]">
                Synthetic Buyer Objection Simulator
              </span>
            </div>
            <h2 className="text-2xl font-bold font-sans text-[#EDEDED] tracking-tight">
              Interactive Customer Persona Interviews
            </h2>
            <p className="text-sm font-sans text-[#A1A1AA] mt-1 max-w-3xl">
              Pitch your value proposition, test pricing sensitivity, and discover hidden objections by interviewing 4 distinct simulated buyer archetypes generated for <span className="text-[#F59E0B] font-semibold">{idea.name}</span>.
            </p>
          </div>

          <button
            id="regenerate-personas-btn"
            onClick={loadPersonas}
            disabled={isLoadingPersonas}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#18181B] hover:bg-[#27272A] text-[#EDEDED] border border-[#3F3F46] rounded-xl text-xs font-mono-code transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingPersonas ? "animate-spin text-[#F59E0B]" : ""}`} />
            Regenerate Personas
          </button>
        </div>
      </div>

      {isLoadingPersonas ? (
        <div className="bg-[#121215] border border-[#27272A] rounded-2xl p-12 text-center">
          <RefreshCw className="w-8 h-8 text-[#F59E0B] animate-spin mx-auto mb-4" />
          <h3 className="text-base font-bold font-sans text-[#EDEDED]">Synthesizing Target Buyer Personas...</h3>
          <p className="text-xs font-mono-code text-[#71717A] mt-1">Analyzing ICP pain points, budgets, and enterprise decision dynamics</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Persona Selection Drawer (Col 4) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-mono-code font-bold uppercase tracking-wider text-[#A1A1AA]">
                Select Buyer Persona ({personas.length})
              </span>
            </div>

            <div className="space-y-3">
              {personas.map((persona) => {
                const isSelected = selectedPersona?.id === persona.id;
                const personaSession = idea.interviewSessions?.find((s) => s.persona.id === persona.id);

                return (
                  <div
                    key={persona.id}
                    id={`persona-card-${persona.id}`}
                    onClick={() => handleSelectPersona(persona)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${
                      isSelected
                        ? "bg-[#18181B] border-[#F59E0B] ring-1 ring-[#F59E0B]"
                        : "bg-[#121215] border-[#27272A] hover:border-[#3F3F46] hover:bg-[#18181B]/70"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={persona.avatar}
                        alt={persona.name}
                        className="w-12 h-12 rounded-full object-cover border border-[#3F3F46] flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold font-sans text-[#EDEDED] truncate">
                            {persona.name}
                          </h4>
                          {personaSession?.overallSummary && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono-code bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                              {personaSession.overallSummary.buyIntentScore}% Fit
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-sans text-[#F59E0B] truncate">{persona.role}</p>
                        <p className="text-[11px] font-mono-code text-[#71717A] truncate">{persona.companyType}</p>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-[#27272A] space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono-code uppercase text-[#71717A]">Disposition:</span>
                        <span className="text-[11px] font-mono-code text-[#EDEDED]">{persona.disposition}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono-code uppercase text-[#71717A]">Budget Authority:</span>
                        <span className="text-[11px] font-mono-code text-[#10B981]">{persona.budgetAuthority}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Persona Deep Profile Card */}
            {selectedPersona && (
              <div className="bg-[#0F0F11] border border-[#27272A] rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-mono-code font-bold uppercase tracking-wider text-[#EDEDED]">
                  <Briefcase className="w-3.5 h-3.5 text-[#F59E0B]" />
                  Buyer Intel & Context
                </div>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <span className="text-[10px] font-mono-code uppercase text-[#71717A] block">Core Pain Point:</span>
                    <p className="text-[#EDEDED] font-sans mt-0.5 leading-relaxed">{selectedPersona.corePain}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono-code uppercase text-[#71717A] block">Current Workaround:</span>
                    <p className="text-[#A1A1AA] font-sans mt-0.5">{selectedPersona.currentWorkaround}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono-code uppercase text-[#EF4444] flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" />
                      Chief Skepticism:
                    </span>
                    <p className="text-[#EDEDED] font-sans mt-0.5 bg-[#EF4444]/10 border border-[#EF4444]/20 p-2 rounded-lg text-xs">
                      {selectedPersona.mainSkepticism}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Chat Console (Col 8) */}
          <div className="lg:col-span-8 space-y-4">
            {selectedPersona ? (
              <div className="bg-[#121215] border border-[#27272A] rounded-2xl flex flex-col h-[650px]">
                {/* Chat Top Header */}
                <div className="p-4 border-b border-[#27272A] bg-[#18181B] rounded-t-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedPersona.avatar}
                      alt={selectedPersona.name}
                      className="w-10 h-10 rounded-full object-cover border border-[#3F3F46]"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold font-sans text-[#EDEDED]">{selectedPersona.name}</h3>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono-code bg-[#27272A] text-[#A1A1AA]">
                          {selectedPersona.disposition}
                        </span>
                      </div>
                      <p className="text-xs font-mono-code text-[#71717A]">
                        {selectedPersona.role} • {selectedPersona.companyType}
                      </p>
                    </div>
                  </div>

                  {/* Dynamic Buy Intent Meter */}
                  <div className="flex items-center gap-2 text-right">
                    <div>
                      <div className="text-[10px] font-mono-code uppercase text-[#71717A]">Purchase Probability</div>
                      <div className="text-sm font-bold font-mono-code text-[#F59E0B]">
                        {latestAiMessage?.buyIntentScore || 45}%
                      </div>
                    </div>
                    <div className="w-12 bg-[#27272A] h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          (latestAiMessage?.buyIntentScore || 45) > 65
                            ? "bg-[#10B981]"
                            : (latestAiMessage?.buyIntentScore || 45) > 40
                            ? "bg-[#F59E0B]"
                            : "bg-[#EF4444]"
                        }`}
                        style={{ width: `${latestAiMessage?.buyIntentScore || 45}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => {
                    const isUser = msg.sender === "founder";
                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
                      >
                        {!isUser && (
                          <img
                            src={selectedPersona.avatar}
                            alt={selectedPersona.name}
                            className="w-8 h-8 rounded-full object-cover border border-[#3F3F46] flex-shrink-0 mt-1"
                          />
                        )}

                        <div className={`max-w-[80%] space-y-1.5`}>
                          <div
                            className={`p-3.5 rounded-2xl text-sm leading-relaxed ${
                              isUser
                                ? "bg-[#F59E0B] text-[#0A0A0B] font-medium rounded-tr-none"
                                : "bg-[#18181B] text-[#EDEDED] border border-[#27272A] rounded-tl-none font-sans"
                            }`}
                          >
                            {msg.text}
                          </div>

                          {!isUser && msg.keyTakeaway && (
                            <div className="flex items-center gap-2 text-[11px] font-mono-code text-[#A1A1AA] px-1">
                              <span
                                className={`px-1.5 py-0.2 rounded text-[9px] uppercase font-bold ${
                                  msg.sentiment === "positive"
                                    ? "bg-[#10B981]/20 text-[#10B981]"
                                    : msg.sentiment === "skeptical"
                                    ? "bg-[#F59E0B]/20 text-[#F59E0B]"
                                    : msg.sentiment === "critical"
                                    ? "bg-[#EF4444]/20 text-[#EF4444]"
                                    : "bg-[#27272A] text-[#A1A1AA]"
                                }`}
                              >
                                {msg.sentiment}
                              </span>
                              <span className="truncate">💡 {msg.keyTakeaway}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {isReplying && (
                    <div className="flex gap-3 items-center text-xs font-mono-code text-[#71717A]">
                      <img
                        src={selectedPersona.avatar}
                        alt={selectedPersona.name}
                        className="w-8 h-8 rounded-full object-cover border border-[#3F3F46] opacity-60"
                      />
                      <div className="flex items-center gap-1.5 bg-[#18181B] border border-[#27272A] px-3.5 py-2 rounded-2xl">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-bounce" />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-bounce [animation-delay:0.4s]" />
                        <span className="ml-2">{selectedPersona.name} is evaluating...</span>
                      </div>
                    </div>
                  )}

                  <div ref={chatBottomRef} />
                </div>

                {/* Quick Probing Questions */}
                <div className="px-4 py-2 bg-[#0F0F11] border-t border-[#27272A] overflow-x-auto flex items-center gap-2">
                  <span className="text-[10px] font-mono-code uppercase text-[#71717A] flex-shrink-0">
                    Probing Prompts:
                  </span>
                  {DEFAULT_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(prompt)}
                      disabled={isReplying}
                      className="text-[11px] font-mono-code px-2.5 py-1 bg-[#18181B] hover:bg-[#27272A] text-[#A1A1AA] hover:text-[#EDEDED] border border-[#27272A] rounded-lg whitespace-nowrap transition-all cursor-pointer disabled:opacity-50"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                {/* Input Bar */}
                <div className="p-3 bg-[#18181B] rounded-b-2xl border-t border-[#27272A]">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      id="interview-message-input"
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder={`Pitch ${selectedPersona.name}, ask about their budget, or address objections...`}
                      disabled={isReplying}
                      className="flex-1 px-4 py-2.5 bg-[#0A0A0B] border border-[#27272A] rounded-xl text-sm font-sans text-[#EDEDED] placeholder:text-[#71717A] focus:outline-none focus:border-[#F59E0B]"
                    />
                    <button
                      id="send-interview-msg-btn"
                      type="submit"
                      disabled={!inputMessage.trim() || isReplying}
                      className="px-4 py-2.5 bg-[#F59E0B] hover:bg-[#D97706] text-[#0A0A0B] font-bold rounded-xl text-xs font-mono-code transition-all cursor-pointer disabled:opacity-40 flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Send
                    </button>
                  </form>
                </div>
              </div>
            ) : null}

            {/* Key Discovery Takeaways Log */}
            {activeSession?.overallSummary && (
              <div className="bg-[#121215] border border-[#27272A] rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#F59E0B]" />
                    <h3 className="text-sm font-bold font-sans text-[#EDEDED]">
                      Discovery Log: {selectedPersona?.name}
                    </h3>
                  </div>
                  <span className="text-xs font-mono-code text-[#10B981]">
                    Intent Score: {activeSession.overallSummary.buyIntentScore}/100
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="bg-[#0F0F11] border border-[#27272A] p-3 rounded-xl space-y-1">
                    <span className="text-[10px] font-mono-code uppercase text-[#EF4444] block">
                      Chief Objection:
                    </span>
                    <p className="text-[#EDEDED] font-sans">
                      {activeSession.overallSummary.topObjections[0]}
                    </p>
                  </div>

                  <div className="bg-[#0F0F11] border border-[#27272A] p-3 rounded-xl space-y-1">
                    <span className="text-[10px] font-mono-code uppercase text-[#10B981] block">
                      Pricing Sensitivity:
                    </span>
                    <p className="text-[#EDEDED] font-sans">
                      {activeSession.overallSummary.priceSensitivityVerdict}
                    </p>
                  </div>

                  <div className="bg-[#0F0F11] border border-[#27272A] p-3 rounded-xl space-y-1">
                    <span className="text-[10px] font-mono-code uppercase text-[#F59E0B] block">
                      Recommended Pitch Pivot:
                    </span>
                    <p className="text-[#EDEDED] font-sans">
                      {activeSession.overallSummary.suggestedPitchTweak}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
