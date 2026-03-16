"use client";

export default function FollowUpHook() {
  return (
    <div className="mt-10 p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl text-center">
      <p className="text-slate-600 text-sm mb-4">
        Need a nudge? We can check in on your progress tomorrow.
      </p>
      <button
        type="button"
        className="inline-flex items-center gap-2 px-6 py-2 bg-white border border-slate-300 hover:border-blue-500 hover:text-blue-600 text-slate-700 font-semibold rounded-lg transition-all shadow-sm"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        Remind me to check progress tomorrow
      </button>
    </div>
  );
}
