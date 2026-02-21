"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Loader2, ChevronUp, ChevronDown } from "lucide-react";

interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency: string;
  projectUsage: string;
  order: number;
}

const CATEGORIES = ["Frontend", "Backend", "DevOps", "Tools"];
const PROFICIENCIES = [
  { value: "daily_driver", label: "Daily Driver" },
  { value: "comfortable", label: "Comfortable" },
  { value: "learning", label: "Learning" },
];

const proficiencyColors: Record<string, string> = {
  daily_driver: "text-indigo-400",
  comfortable: "text-violet-400",
  learning: "text-neutral-400",
};

function SkillRow({
  skill,
  isFirst,
  isLast,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  skill: Skill;
  isFirst: boolean;
  isLast: boolean;
  onUpdate: (id: string, data: Partial<Skill>) => void;
  onDelete: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
}) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Delete "${skill.name}"?`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/skills?id=${skill.id}`, { method: "DELETE" });
      if (res.ok) onDelete(skill.id);
    } finally {
      setDeleting(false);
    }
  };

  const handleField = async (field: keyof Skill, value: string | number) => {
    onUpdate(skill.id, { [field]: value });
    try {
      await fetch(`/api/skills?id=${skill.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const inputClass =
    "rounded-lg border border-neutral-800 bg-neutral-900/50 px-3 py-1.5 text-sm text-white placeholder:text-neutral-600 focus:border-indigo-500/50 focus:outline-none transition-colors";

  return (
    <div className="flex items-start gap-2 group">
      {/* Order buttons */}
      <div className="flex flex-col gap-0.5 pt-1">
        <button
          onClick={() => onMoveUp(skill.id)}
          disabled={isFirst}
          className="rounded p-0.5 text-neutral-600 hover:text-neutral-300 disabled:opacity-20 transition-colors"
        >
          <ChevronUp className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onMoveDown(skill.id)}
          disabled={isLast}
          className="rounded p-0.5 text-neutral-600 hover:text-neutral-300 disabled:opacity-20 transition-colors"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Name */}
      <input
        type="text"
        defaultValue={skill.name}
        onBlur={(e) => handleField("name", e.target.value)}
        placeholder="Skill name"
        className={`${inputClass} w-32`}
      />

      {/* Proficiency */}
      <select
        value={skill.proficiency}
        onChange={(e) => handleField("proficiency", e.target.value)}
        className={`${inputClass} ${proficiencyColors[skill.proficiency] ?? ""} bg-neutral-900`}
      >
        {PROFICIENCIES.map((p) => (
          <option key={p.value} value={p.value} className="text-white bg-neutral-900">
            {p.label}
          </option>
        ))}
      </select>

      {/* Project usage */}
      <input
        type="text"
        defaultValue={skill.projectUsage}
        onBlur={(e) => handleField("projectUsage", e.target.value)}
        placeholder="Used in... (tooltip)"
        className={`${inputClass} flex-1`}
      />

      {/* Delete */}
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="mt-0.5 rounded-lg border border-neutral-800 p-1.5 text-neutral-500 hover:border-red-500/50 hover:text-red-400 disabled:opacity-50 transition-colors"
      >
        {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

function AddSkillForm({
  category,
  onAdd,
}: {
  category: string;
  onAdd: (skill: Skill) => void;
}) {
  const [name, setName] = useState("");
  const [proficiency, setProficiency] = useState("daily_driver");
  const [projectUsage, setProjectUsage] = useState("");
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), category, proficiency, projectUsage }),
      });
      const data = await res.json();
      if (data.success) {
        onAdd(data.data as Skill);
        setName("");
        setProjectUsage("");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "rounded-lg border border-neutral-800 bg-neutral-900/50 px-3 py-1.5 text-sm text-white placeholder:text-neutral-600 focus:border-indigo-500/50 focus:outline-none transition-colors";

  return (
    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-neutral-800/50">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        placeholder="New skill..."
        className={`${inputClass} w-32`}
      />
      <select
        value={proficiency}
        onChange={(e) => setProficiency(e.target.value)}
        className={`${inputClass} bg-neutral-900`}
      >
        {PROFICIENCIES.map((p) => (
          <option key={p.value} value={p.value} className="bg-neutral-900">
            {p.label}
          </option>
        ))}
      </select>
      <input
        type="text"
        value={projectUsage}
        onChange={(e) => setProjectUsage(e.target.value)}
        placeholder="Used in..."
        className={`${inputClass} flex-1`}
      />
      <button
        onClick={handleAdd}
        disabled={saving || !name.trim()}
        className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors"
      >
        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
        Add
      </button>
    </div>
  );
}

export function SkillsManager() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/skills")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setSkills(data.data as Skill[]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const updateSkill = (id: string, data: Partial<Skill>) => {
    setSkills((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
  };

  const deleteSkill = (id: string) => {
    setSkills((prev) => prev.filter((s) => s.id !== id));
  };

  const addSkill = (skill: Skill) => {
    setSkills((prev) => [...prev, skill]);
  };

  const moveSkill = async (id: string, direction: "up" | "down", category: string) => {
    const catSkills = skills.filter((s) => s.category === category);
    const idx = catSkills.findIndex((s) => s.id === id);
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === catSkills.length - 1) return;

    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    const newOrder = catSkills.map((s, i) => ({ ...s, order: i }));
    // Swap orders
    const tmpOrder = newOrder[idx].order;
    newOrder[idx].order = newOrder[swapIdx].order;
    newOrder[swapIdx].order = tmpOrder;
    // Swap positions in array
    [newOrder[idx], newOrder[swapIdx]] = [newOrder[swapIdx], newOrder[idx]];

    setSkills((prev) => {
      const others = prev.filter((s) => s.category !== category);
      return [...others, ...newOrder].sort((a, b) => {
        if (a.category !== b.category) return a.category.localeCompare(b.category);
        return a.order - b.order;
      });
    });

    // Persist both swapped skills
    await Promise.all([
      fetch(`/api/skills?id=${newOrder[idx].id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: newOrder[idx].order }),
      }),
      fetch(`/api/skills?id=${newOrder[swapIdx].id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: newOrder[swapIdx].order }),
      }),
    ]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-neutral-500">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Loading skills...
      </div>
    );
  }

  const allCategories = [
    ...CATEGORIES,
    ...[...new Set(skills.map((s) => s.category))].filter((c) => !CATEGORIES.includes(c)),
  ];

  return (
    <div className="flex flex-col gap-6">
      {allCategories.map((category) => {
        const catSkills = skills
          .filter((s) => s.category === category)
          .sort((a, b) => a.order - b.order);

        return (
          <div
            key={category}
            className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-6"
          >
            <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-4">
              {category}
            </h2>

            {catSkills.length === 0 && (
              <p className="text-sm text-neutral-600 mb-2">No skills yet.</p>
            )}

            <div className="flex flex-col gap-2.5">
              {catSkills.map((skill, i) => (
                <SkillRow
                  key={skill.id}
                  skill={skill}
                  isFirst={i === 0}
                  isLast={i === catSkills.length - 1}
                  onUpdate={updateSkill}
                  onDelete={deleteSkill}
                  onMoveUp={(id) => moveSkill(id, "up", category)}
                  onMoveDown={(id) => moveSkill(id, "down", category)}
                />
              ))}
            </div>

            <AddSkillForm category={category} onAdd={addSkill} />
          </div>
        );
      })}
    </div>
  );
}
