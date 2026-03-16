# AI Life Assistant — Project Plan
> Internal name: LifeAssist  
> Stack: React/Next.js · Node.js or Python · Anthropic/OpenAI API  
> Team: **You** (Backend/AI) · **Chris** (Frontend/UI)

---

## 🗂 Project Structure

```
lifeassist/
├── frontend/          # You
│   ├── components/
│   ├── pages/
│   └── styles/
├── backend/           # Chris
│   ├── routes/
│   ├── prompts/
│   └── classifiers/
└── plan.md
```

---

## ✅ Phase 1 — MVP

### 👤 Chris (Frontend)

- [x] Scaffold Next.js or React project
- [x] Build **Home Screen** with input box and example suggestion chips
- [x] Build **Results Screen** layout:
  - [x] Situation card (detected category)
  - [x] Possible causes list
  - [x] Action plan steps
  - [x] Tools section (Generate Message / Adjust Plan / Ask Follow-Up)
- [x] Wire up API calls to backend endpoints
- [x] Handle loading and error states
- [x] Style the full UI (clean, calm, readable)

### 👤 You (Backend/AI)

- [ ] Set up Node.js or Python backend with API routing
- [ ] Integrate LLM provider (OpenAI/Anthropic API)
- [ ] Build **Situation Analysis** endpoint
  - [ ] Accept user input text
  - [ ] Classify situation into category (work stress, relationship conflict, etc.)
  - [ ] Return possible causes
- [ ] Build **Action Plan Generator** endpoint
  - [ ] Generate step-by-step plan based on situation
- [ ] Build **Message Generator** endpoint
  - [ ] Draft communication message based on situation context
- [ ] Create structured prompt templates for each situation type:
  - [ ] Work stress
  - [ ] Relationship conflict
  - [ ] Career change
  - [ ] Financial stress
  - [ ] Productivity issues

---

## ✅ Phase 2 — Polish & Follow-Up

### 👤 Chris (Frontend)

- [ ] Add **Follow-Up prompt UI** ("Did you talk to your manager today?")
- [ ] Add Yes / Not Yet response buttons
- [ ] Show additional help panel if "Not yet" selected
- [ ] Improve mobile responsiveness
- [ ] Add subtle animations / transitions between screens

### 👤 You (Backend/AI)

- [ ] Build **Follow-Up Support** endpoint
  - [ ] Track current situation context
  - [ ] Return contextual next step based on follow-up response
- [ ] Improve prompt quality and response formatting
- [ ] Add fallback handling for unrecognised situations
- [ ] Validate and sanitise all user inputs

---

## 🔮 Phase 3 — Future (Post-MVP)

> Not in scope yet — plan together when MVP is done.

| Feature | Likely Owner |
|---|---|
| User accounts & auth | You |
| Conversation / session history | You |
| Life planning module | Both |
| Career coaching templates | You |
| Mental wellness prompts | You |
| Financial decision support | You |
| Personal productivity coaching | Both |

---

## 🚀 Demo Scenarios to Test

| Scenario | Input | Expected Output |
|---|---|---|
| Work stress | "I'm overwhelmed at work." | Situation analysis + action plan |
| Roommate conflict | "I'm arguing with my roommate." | Conflict resolution + message draft |
| Career change | "I want a better job." | Career improvement plan |

---

## 📌 Notes for Cursor

- Keep components small and focused — one job per file
- All AI responses should be **framed as guidance**, not authoritative advice
- Use structured prompt templates — avoid freeform prompting
- API responses should always return: `{ situation, causes, plan, message }`
- Start with static situation templates before adding dynamic classification
