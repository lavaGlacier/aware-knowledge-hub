# AWARE - Adaptive Workplace AI for Reliable Execution

**Live:** [aware-ai-hub.netlify.app](https://aware-ai-hub.netlify.app)

Every company runs on institutional knowledge - SOPs, HR policies, client contracts, onboarding checklists, internal processes. That knowledge almost never makes it into the AI tools teams use daily.

AWARE fixes that. It layers your company's internal documents on top of any AI model so that every answer is grounded in how *your* org actually operates - not just general internet knowledge.

Ask it anything. It knows your processes.

---

## The problem it solves

Generic AI is powerful but context-blind. It doesn't know your refund policy, your client escalation SOP, or how your team handles onboarding. So employees either don't use AI for operational questions, or they get answers that don't match how the company actually works.

AWARE bridges that gap - coupling general AI intelligence with your internal knowledge base to give context-rich, org-specific answers at every level of the business.

---

## Core features

- **Document-grounded AI chat** - responses pull from your uploaded internal docs first, then fall back to general AI knowledge
- **Role-based document access** - different employees see different document classifications; sensitive contracts aren't visible to everyone
- **Multi-document support** - ingest SOPs, HR policies, checklists, contracts, onboarding guides, and more
- **Org-wide deployment** - built to serve everyone from new hires to leadership, each with access appropriate to their role

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + Vite |
| UI | shadcn/ui + Tailwind CSS |
| Testing | Playwright + Vitest |
| Deployment | Netlify |

---

## Local setup

```bash
# 1. Clone the repo
git clone https://github.com/lavaGlacier/aware-knowledge-hub.git
cd aware-knowledge-hub

# 2. Install dependencies
npm install

# 3. Add environment variables
cp .env .env.local
# Fill in your AI model API key and any required config

# 4. Start the dev server
npm run dev
```

App runs at `http://localhost:8080` by default.

---

## Roadmap

- [ ] Admin panel for document upload and access classification
- [ ] Multi-model support (swap between AI providers)
- [ ] Query audit log
- [ ] Slack / Teams integration
- [ ] Semantic search and document tagging

---

## Built by

[Sparsh Agarwal](https://www.linkedin.com/in/sparsh-illuminate/) - [illuminate.global](https://illuminate.global)
