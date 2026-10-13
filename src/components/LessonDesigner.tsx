import React, { useState } from "react";
import { Lesson } from "../types";
import { Plus, Trash2, Save, Play } from "lucide-react";

interface LessonDesignerProps {
  customLessons: Lesson[];
  onSaveLesson: (lesson: Lesson) => void;
  onDeleteLesson: (id: string) => void;
  onTestLesson?: (id: string) => void;
}

export function LessonDesigner({
  customLessons,
  onSaveLesson,
  onDeleteLesson,
  onTestLesson,
}: LessonDesignerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [difficulty, setDifficulty] = useState<
    "beginner" | "intermediate" | "advanced"
  >("beginner");

  const handleSave = () => {
    if (!title.trim() || !text.trim()) return;

    onSaveLesson({
      id: `custom_${Date.now()}`,
      title,
      text,
      difficulty,
    });

    setTitle("");
    setText("");
    setDifficulty("beginner");
    setIsCreating(false);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
            Lesson Designer
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Create custom typing exercises for specific needs or students.
          </p>
        </div>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-sm hover:bg-indigo-700 transition-colors w-full sm:w-auto"
          >
            <Plus size={20} />
            Create Lesson
          </button>
        )}
      </div>

      {isCreating && (
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-indigo-200 shadow-md">
          <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-4">
            New Custom Lesson
          </h3>

          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Lesson Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Legal Terminology Practice"
                className="w-full px-3 sm:px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm sm:text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full px-3 sm:px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white text-sm sm:text-base"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Lesson Text
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter the text for the typing exercise here..."
                rows={5}
                className="w-full px-3 sm:px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-mono resize-y text-sm sm:text-base"
              />
              <p className="text-xs text-slate-500 mt-1">
                Character count: {text.length}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-4">
              <button
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors w-full sm:w-auto order-2 sm:order-1 text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!title.trim() || !text.trim()}
                className="flex items-center justify-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto order-1 sm:order-2 text-sm sm:text-base"
              >
                <Save size={18} />
                Save Lesson
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="text-base sm:text-lg font-bold text-slate-800">
            Your Custom Lessons
          </h3>
        </div>

        {customLessons.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No custom lessons created yet. Click "Create Lesson" to get started.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {customLessons.map((lesson) => (
              <div
                key={lesson.id}
                className="p-4 sm:p-6 flex flex-col sm:flex-row items-start justify-between hover:bg-slate-50 transition-colors gap-4"
              >
                <div className="flex-grow pr-0 sm:pr-8 w-full">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                    <h4 className="text-base sm:text-lg font-bold text-slate-800">
                      {lesson.title}
                    </h4>
                    <span
                      className={`text-[10px] sm:text-xs font-semibold px-2 py-1 rounded-full uppercase tracking-wider
                      ${
                        lesson.difficulty === "beginner"
                          ? "bg-green-100 text-green-700"
                          : lesson.difficulty === "intermediate"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {lesson.difficulty}
                    </span>
                  </div>
                  <p className="text-slate-600 font-mono text-xs sm:text-sm line-clamp-2 bg-slate-100 p-2 rounded">
                    {lesson.text}
                  </p>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-start">
                  {onTestLesson && (
                    <button
                      onClick={() => onTestLesson(lesson.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                      title="Practice this lesson"
                    >
                      <Play size={15} />
                      Practice
                    </button>
                  )}
                  <button
                    onClick={() => onDeleteLesson(lesson.id)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Lesson"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
