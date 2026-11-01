"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Palette, Image, Type, Share2, Download } from "lucide-react";
import { aiApi } from "@/lib/api";
import { toast } from "sonner";

const CREATIVE_TOOLS = [
  { id: "theme", label: "Event Themes", icon: Palette, description: "Generate theme concepts with color palettes and style guides" },
  { id: "invitation", label: "Invitation Copy", icon: Type, description: "Create personalized invitation text in multiple styles" },
  { id: "social", label: "Social Media Captions", icon: Share2, description: "Generate captions for Instagram, WhatsApp, and more" },
  { id: "poster", label: "Event Poster Concepts", icon: Image, description: "Describe poster concepts for your designer" },
];

const DEMO_THEMES = [
  {
    name: "Royal Heritage",
    description: "A grand traditional Indian aesthetic with rich jewel tones, gold accents, and ornate patterns.",
    colors: ["#7B1E3A", "#D4AF37", "#1B3A5C", "#8B7355"],
    keywords: ["Regal", "Traditional", "Gold", "Marigold", "Heritage"],
  },
  {
    name: "Modern Garden",
    description: "Fresh and contemporary with lush greenery, soft florals, and natural elements.",
    colors: ["#2D5016", "#F5E6CC", "#E8B4A0", "#7AA68A"],
    keywords: ["Fresh", "Natural", "Romantic", "Botanical", "Airy"],
  },
  {
    name: "Celestial Night",
    description: "Deep midnight blues and silvers with star and moon motifs for an enchanting evening affair.",
    colors: ["#0B1A3C", "#C0C0C0", "#4A5C8A", "#E8D5B7"],
    keywords: ["Mystical", "Elegant", "Evening", "Stars", "Ethereal"],
  },
];

export default function CreativeStudioPage() {
  const [selectedTool, setSelectedTool] = useState("theme");
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please describe what you want to generate");
      return;
    }
    setIsGenerating(true);
    try {
      await aiApi.chat({ message: `Generate creative content for: ${prompt}` });
      toast.success("Content generated! (Connect AI service for real results)");
    } catch {
      toast.error("AI service unavailable. Configure API keys to enable creative generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Palette className="w-6 h-6 text-violet-600" />
          AI Creative Studio
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">Generate themes, invitations, and creative content for your events.</p>
      </div>

      {/* Tools */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {CREATIVE_TOOLS.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setSelectedTool(tool.id)}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              selectedTool === tool.id
                ? "border-violet-500 bg-violet-50 dark:bg-violet-950"
                : "border-slate-200 dark:border-slate-700 hover:border-violet-300"
            }`}
          >
            <tool.icon className={`w-5 h-5 mb-2 ${selectedTool === tool.id ? "text-violet-600" : "text-slate-500"}`} />
            <p className="text-sm font-semibold text-slate-800 dark:text-white">{tool.label}</p>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{tool.description}</p>
          </button>
        ))}
      </div>

      {/* Generation input */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-600" />
            Generate {CREATIVE_TOOLS.find(t => t.id === selectedTool)?.label}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={
              selectedTool === "theme"
                ? "Describe your event: 'Traditional Telugu wedding for 300 guests in Hyderabad. Outdoor venue, February 2027, budget ₹15L. The couple loves marigolds and peacock motifs.'"
                : "Describe what you need..."
            }
            rows={4}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
          />
          <Button variant="gradient" onClick={handleGenerate} loading={isGenerating}>
            <Sparkles className="w-4 h-4" />
            Generate with AI
          </Button>
          <p className="text-xs text-slate-400">
            AI-generated content is a starting point. Always review and personalize before use.
          </p>
        </CardContent>
      </Card>

      {/* Sample themes */}
      {selectedTool === "theme" && (
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Sample Generated Themes
            <Badge variant="secondary" className="ml-2 text-xs">Demo Output</Badge>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {DEMO_THEMES.map((theme) => (
              <Card key={theme.name} hover>
                <CardContent className="p-5">
                  <div className="flex gap-2 mb-3">
                    {theme.colors.map((color) => (
                      <div
                        key={color}
                        className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-1">{theme.name}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                    {theme.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {theme.keywords.map((kw) => (
                      <Badge key={kw} variant="outline" className="text-xs">{kw}</Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      Use Theme
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Download className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
