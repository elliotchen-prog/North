"use client";

interface PossibleCausesProps {
  causes: string[];
}

export default function PossibleCauses({ causes }: PossibleCausesProps) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <svg
          className="w-5 h-5 text-amber-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
        <h3 className="text-amber-800 font-bold uppercase text-xs tracking-widest">
          Possible Causes Identified
        </h3>
      </div>

      <div className="flex flex-wrap gap-2">
        {causes.map((cause, index) => (
          <span
            key={index}
            className="px-3 py-1 bg-white border border-amber-200 text-amber-900 text-sm rounded-full shadow-sm flex items-center gap-2"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
            {cause}
          </span>
        ))}
      </div>
    </div>
  );
}
