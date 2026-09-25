"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Search,
  Plus,
  Save,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Edit3,
  Layers,
  Sparkles,
  ShieldAlert,
} from "lucide-react";
import { KBArticle } from "@/lib/types";
import { detectPromptInjection } from "@/lib/security";

export const KnowledgeBaseManager: React.FC = () => {
  const [articles, setArticles] = useState<KBArticle[]>([]);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Editor State
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("General");
  const [visibility, setVisibility] = useState<"public" | "internal">("public");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);
  const [activeTab, setActiveTab] = useState<"edit" | "preview" | "chunks">("edit");

  // Live Prompt Injection Risk Detection
  const injectionRisk = detectPromptInjection(body);

  const loadArticles = async () => {
    try {
      const res = await fetch("/api/v1/kb");
      if (res.ok) {
        const data = await res.json();
        setArticles(data.articles || []);
        if (!selectedArticleId && data.articles?.length > 0) {
          selectArticle(data.articles[0]);
        }
      }
    } catch (e) {
      console.error("Failed to load KB articles:", e);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const selectArticle = (art: KBArticle) => {
    setSelectedArticleId(art.id);
    setTitle(art.title);
    setBody(art.body);
    setCategory(art.category);
    setVisibility(art.visibility);
  };

  const handleCreateNew = () => {
    setSelectedArticleId(null);
    setTitle("");
    setBody("");
    setCategory("Technical");
    setVisibility("public");
    setActiveTab("edit");
  };

  const handleSave = async () => {
    if (!title.trim() || !body.trim() || isSaving) return;
    setIsSaving(true);

    try {
      const token = localStorage.getItem("ecosphere_token") || "mock_dev_token";

      if (selectedArticleId) {
        // Update existing article
        const res = await fetch(`/api/v1/kb/${selectedArticleId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ title, body, category, visibility }),
        });
        if (res.ok) {
          setSaveSuccessNotice(true);
          setTimeout(() => setSaveSuccessNotice(false), 3000);
          loadArticles();
        }
      } else {
        // Create new article
        const res = await fetch("/api/v1/kb", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ title, body, category, visibility }),
        });
        if (res.ok) {
          const data = await res.json();
          setSelectedArticleId(data.article.id);
          setSaveSuccessNotice(true);
          setTimeout(() => setSaveSuccessNotice(false), 3000);
          loadArticles();
        }
      }
    } catch (e) {
      console.error("Save error:", e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedArticleId) return;
    if (!confirm("Are you sure you want to delete this article and its vector embeddings?")) return;

    try {
      const token = localStorage.getItem("ecosphere_token") || "mock_dev_token";
      const res = await fetch(`/api/v1/kb/${selectedArticleId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        loadArticles();
        handleCreateNew();
      }
    } catch (e) {
      console.error("Delete error:", e);
    }
  };

  const filteredArticles = articles.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.body.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === "all" || a.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  // Calculate chunks for visualization
  const chunks = body.split("\n\n").filter((p) => p.trim().length > 15);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-4 space-y-4">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm shadow-amber-500/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Knowledge Base & Grounding RAG Store
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                {articles.length} Articles
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Source of truth for all AI-grounded customer answers. Auto-chunked & re-indexed on save.
            </p>
          </div>
        </div>

        <button
          onClick={handleCreateNew}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          New Article
        </button>
      </div>

      {/* 2-Column Interface: Article List + Split Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[750px]">
        {/* Left Column: Article List (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
          {/* Search & Category Filter */}
          <div className="p-3 border-b border-slate-100 bg-slate-50/70 space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="Technical">Technical</option>
              <option value="Billing">Billing</option>
              <option value="Account">Account</option>
              <option value="General">General</option>
            </select>
          </div>

          {/* Article List Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredArticles.map((art) => {
              const isSelected = selectedArticleId === art.id;
              return (
                <div
                  key={art.id}
                  onClick={() => selectArticle(art)}
                  className={`p-3.5 cursor-pointer transition-all ${
                    isSelected
                      ? "bg-amber-50/70 border-l-4 border-l-amber-500"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-bold text-slate-400">
                      v{art.version}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {art.category}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 truncate mb-1">
                    {art.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {art.body}
                  </p>
                  {art.injectionRiskDetected && (
                    <div className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 w-fit">
                      <ShieldAlert className="w-3 h-3" />
                      Prompt Injection Flagged
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Split Editor & Chunk Preview (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
          {/* Editor Header Bar */}
          <div className="p-3.5 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("edit")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === "edit"
                    ? "bg-white text-slate-900 shadow-2xs border border-slate-200"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                Editor
              </button>
              <button
                onClick={() => setActiveTab("preview")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === "preview"
                    ? "bg-white text-slate-900 shadow-2xs border border-slate-200"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                Rendered Preview
              </button>
              <button
                onClick={() => setActiveTab("chunks")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === "chunks"
                    ? "bg-white text-slate-900 shadow-2xs border border-slate-200"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                Vector Chunks ({chunks.length})
              </button>
            </div>

            <div className="flex items-center gap-2">
              {selectedArticleId && (
                <button
                  onClick={handleDelete}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                  title="Delete article"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={handleSave}
                disabled={isSaving || !title.trim() || !body.trim()}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-2xs transition-colors disabled:opacity-40"
              >
                <Save className="w-3.5 h-3.5" />
                {isSaving ? "Re-Indexing..." : "Save & Embed"}
              </button>
            </div>
          </div>

          {/* Prompt Injection Live Warning Banner (Section 4 & 6 Spec) */}
          {injectionRisk.isSuspicious && (
            <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2 text-xs text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Warning (Injection Guardrail):</strong> Content appears to contain instructions addressed to the AI (&ldquo;{injectionRisk.matchedPattern}&rdquo;). Flagged for review before publishing.
              </span>
            </div>
          )}

          {/* Success Save Toast */}
          {saveSuccessNotice && (
            <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 flex items-center gap-2 text-xs text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Article successfully saved and <strong>vector chunks embedded</strong> for instant RAG grounding!
              </span>
            </div>
          )}

          {/* Editor Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {/* Title & Category Input */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Article Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. API Rate Limits & Authentication Guide"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Technical">Technical</option>
                  <option value="Billing">Billing</option>
                  <option value="Account">Account</option>
                  <option value="General">General</option>
                </select>
              </div>
            </div>

            {/* Split Content Area depending on Tab */}
            {activeTab === "edit" ? (
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Content (Markdown Supported)
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={16}
                  placeholder="Write clear, factual documentation for the AI to ground against..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            ) : activeTab === "preview" ? (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 min-h-[350px] prose prose-sm max-w-none text-xs text-slate-800 leading-relaxed whitespace-pre-line">
                <h2 className="text-sm font-bold text-slate-900 mb-2">{title}</h2>
                {body}
              </div>
            ) : (
              /* Vector Chunks Preview */
              <div className="space-y-3">
                <p className="text-xs text-slate-500">
                  EcoSphere automatically splits articles by paragraph and generates 256-dimensional semantic embeddings for cosine similarity retrieval:
                </p>
                <div className="space-y-2">
                  {chunks.map((chunk, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                    >
                      <div className="flex items-center justify-between text-[10px] font-bold text-indigo-700 mb-1">
                        <span>Chunk #{i + 1}</span>
                        <span>Vector: 256 dimensions</span>
                      </div>
                      <p className="italic text-slate-700 leading-relaxed">{chunk}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
