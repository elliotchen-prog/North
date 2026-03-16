"use client";

const SUGGESTIONS = [
  "I'm overwhelmed at work.",
  "I want a better job.",
  "I'm arguing with my roommate.",
  "I need help organizing my life.",
  "How do I make Greg proud of my presentation?",
];

interface HomeScreenProps {
  onSubmit: (input: string) => void;
  isLoading?: boolean;
}

export default function HomeScreen({ onSubmit, isLoading }: HomeScreenProps) {
  return (
    <main className="max-w-xl mx-auto px-4 py-12 sm:py-16">
      <h1 className="text-3xl sm:text-4xl font-bold text-stone-800 text-center mb-2">
        AI Life Assistant
      </h1>
      <p className="text-stone-500 text-sm sm:text-base text-center mb-8">
        From problem → clarity → action
      </p>

      <p className="text-stone-600 mb-3">How can I help today?</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const input = new FormData(e.currentTarget).get("input") as string;
          if (input?.trim()) onSubmit(input.trim());
        }}
        className="space-y-4"
      >
        <textarea
          name="input"
          placeholder="Describe what's on your mind..."
          rows={3}
          disabled={isLoading}
          className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-400/20 focus:border-teal-500 resize-none transition-shadow duration-200"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-xl bg-teal-600 text-white py-3.5 font-medium hover:bg-teal-700 hover:shadow-md hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none transition-all duration-200"
        >
          {isLoading ? "Analyzing…" : "Get guidance"}
        </button>
      </form>

      <p className="text-stone-500 text-sm mt-6 mb-2">Example suggestions:</p>
      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((text) => (
          <button
            key={text}
            type="button"
            onClick={() => onSubmit(text)}
            disabled={isLoading}
            className="rounded-full border border-stone-200 bg-white px-5 py-2.5 text-sm text-stone-600 hover:border-teal-300 hover:text-teal-700 hover:bg-teal-50/50 transition-colors duration-150 disabled:opacity-60"
          >
            {text}
          </button>
        ))}
      </div>
    </main>
  );
}
