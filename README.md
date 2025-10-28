🧠 Team2 QA Hackathon – Smart QA Intelligence Platform

Welcome to the Team2 QA Intelligence Platform, an automated system that:
• Executes automation tests using Playwright
• Generates enriched test result insights
• Visualizes trends with a React Triage Dashboard
• Sends Slack & Email notifications
• Auto-deploys dashboard via GitHub Pages

Perfect for accelerating root cause analysis, reducing triage time, and delivering smarter CI/CD pipelines.

==============For E2E Demo Purpose==============
Install all dependencies( Step 1 to 3) and From project root, open terminal, run the below command.
command : npm run full:demo

==============🚀 Quick Start==================
==============✅ 1️⃣ Prerequisites==============

Ensure you have these installed:

Node.js 18+
npm or yarn
Git

(Optional but recommended) - VS Code + Playwright Test Extension

==============📥 2️⃣ Clone the Repository==============
git clone https://github.com/<your-repo>/next-gen-qa-hackathon.git
cd next-gen-qa-hackathon

==============📦 3️⃣ Install Dependencies==============
For Dashboard
cd triage-dashboard
npm install

For Playwright Tests
cd ../playwright-tests
npm install
npx playwright install

==============🧪 4️⃣ Run Automation Tests Locally==============
cd playwright-tests
npm test

Results are saved here:

/playwright-tests/results/

==============🧬 5️⃣ Generate Enriched Data (Used by Dashboard)==============

The pipeline converts test results to JSONL.
To simulate locally:

npm run enrich

Enriched data output:

triage-dashboard/src/data/TestData.enriched.jsonl

==============🎯 6️⃣ Start the Dashboard (Local Preview)==============
cd ../triage-dashboard
npm start

Open in your browser: http://localhost:3000/

==============Enjoy dashboards like:==============
✅ CI/CD Success Over Time
✅ Failure Heatmaps & Clustering
✅ Smart QA Root Cause Visuals
✅ Category-based grouping

==============🛰 CI/CD Pipeline Overview==============

Every push to main triggers GitHub Actions:

Stage	Actions
✅ Build Dashboard	npm install + npm run build
✅ Run Tests	Playwright execution
✅ Generate Data	Enrich JSONL output
✅ Deploy Dashboard	GitHub Pages
✅ Notifications	Slack + Email

Your dashboard is always live & up-to-date with latest results.

==============📁 Folder Structure==============
next-gen-qa-hackathon/
 ├─ triage-dashboard/        # React UI
 │   ├─ src/components/      # Charts, Tables, AI visuals
 │   ├─ src/data/            # Enriched test history inputs
 │   └─ build/               # Production assets
 ├─ playwright-tests/        # E2E automation suite
 │   └─ results/             # Test outputs
 └─ .github/workflows/       # CI pipeline

==============🔌 Integrations==============
Service	Purpose
GitHub Pages	Dashboard hosting
Slack	Run status alerts
Email	Test summary notifications

==============🤝 Contribution Guide==============

1️⃣ Create a feature branch
2️⃣ Add/Update tests
3️⃣ Submit PR with screenshots + results

Naming rule:

feature/<ticket-id>-<summary>

==============🏆 Hackathon Value Proposition==============

🎯 Faster triage
📈 Continuous visibility
🤖 AI-powered insights
⏱ Reduced QA friction

Bring metrics to life, instantly.

==============🧑‍💻 Maintainers==============

Team2 QA Hackathon
For issues or enhancements: Open a GitHub Issue
