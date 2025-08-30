Glide – AI-Powered Airdrop Farmer

Overview:
Glide is a decentralized agent platform that automates qualifying for, claiming, and consolidating airdrops across multiple protocols. It leverages AI agents, gasless meta-transactions, and social scraping (Twitter + Telegram) to maximize user eligibility for upcoming airdrops — all with a single click.

Key Features

Wallet Connect: Users connect their Avalanche wallet.

Protocol Selection: Choose supported protocols with airdrop opportunities.

AI-Powered Task Automation: Glide’s agents execute qualifying interactions (swaps, liquidity, governance) automatically.

Social Scraping Engine: Scans Twitter & Telegram for new airdrop announcements, extracts requirements, and feeds them to the pipeline.

Airdrop Tracker: Dashboard view of eligibility, progress, and potential rewards.

Gasless Claims: Powered by OXgasless kit + meta-transactions, allowing users to consolidate rewards without paying gas.

Manual Claim Approval (MVP): Users approve final claim action for safety and control.

Tech Stack

Blockchain: Avalanche

Smart Contracts:

Glide Smart Account / Relayer (meta-transaction support)

Airdrop Task Executor (records & verifies task completion)

Claim Proxy (one-click claim execution)

AI Agent Layer: OXgasless Agent Kit (multi-agent orchestration)

Scraping Engine: Twitter + Telegram crawler (NLP-based parsing)

Frontend: Next.js dashboard (progress tracking, protocol selection, claim flow)

Agentic Pipeline

Signal Collection:

Glide scrapers monitor Twitter/Telegram → extract eligibility rules.

Task Generation:

AI agent converts rules → on-chain actionable tasks (swap, stake, vote).

Task Execution:

Gasless relayer executes tasks via Glide Smart Account.

Eligibility Tracking:

Task Executor logs progress → dashboard updates in real time.

Claiming:

User approves → Claim Proxy consolidates rewards → tokens sent gaslessly to wallet
