# TegrityVoyageManagement - 'TVM'

[![Cloud Run Service](https://img.shields.io/badge/GCP%20Cloud%20Run-tegrity--tvm--web-blue?logo=googlecloud)](https://tegrity-tvm-web-1079602674268.us-central1.run.app)
[![Node.js](https://img.shields.io/badge/Node.js-v20+-green?logo=nodedotjs)](https://nodejs.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-cyan?logo=docker)](Dockerfile)

**TegrityVoyageManagement ('TVM')** is a dedicated, standalone enterprise maritime application for multi-tenant administration, contract fixtures, vessel registries, rider clause precedence rules, master instructions, and marine insurance risk management.

TVM features **100% UI-UX alignment with TegrityVoyageOperation (TVO)**, a real-time **Cascading Operational Filter Engine**, and complete **CRUD (Create, Read, Update, Delete)** operations across all 9 maritime operational modules.

---

## 🚀 Live Cloud Run Deployment

- **Live Service URL**: [https://tegrity-tvm-web-1079602674268.us-central1.run.app](https://tegrity-tvm-web-1079602674268.us-central1.run.app)
- **GCP Project**: `voyageiq-dev`
- **Region**: `us-central1`
- **Default Admin Credentials**:
  - **Username**: `admin`
  - **Password**: `admin`

---

## 🏢 9 Core Management Modules (Full CRUD)

1. **🏢 Organization Management**: Multi-tenant directory (Organization Name, Tenant Code, Domain Authorization, Country, Status).
2. **🚢 Fleet Management**: Operational fleet classification (Tanker Fleet, Bulk Carrier Fleet, LNG Fleet, Manager, Vessel Count).
3. **⚓ Ship Management**: IMO vessel profile registry (IMO Number, Vessel Name, Type, Flag State, DWT Capacity, Built Year, Owner).
4. **📑 Charter Party Management**: Standard CP form vault (BPVOY4, SHELLVOY6, NYPE 93, ASBATANKVOY, BARECON 2017), governing laws, laytime terms, demurrage rates, claims time bar.
5. **⏱️ Time Contract Management**: Time charter fixtures (Contract ID, Vessel, Charterer, Daily Hire Rate, Delivery/Redelivery Ports, Commence/Expiry Dates, Fuel Specs).
6. **📜 Voyage Contract Management**: Voyage charter fixtures (Contract ID, Voyage No, Vessel, Charterer, Load/Discharge Ports, Cargo & Quantity MT, Freight Rate $/MT, Laycan Window).
7. **✒️ Rider Clause Management**: Rider clause repository, clause categorization, contract association, and printed form precedence override rules.
8. **📋 Master Instruction**: Formal voyage instructions issued to Vessel Master & Port Agents (Instruction No, Contract Ref, Priority, Loading & Bunkering Instructions).
9. **🛡️ Insurance Management**: Marine risk & insurance policy register (Policy No, Vessel Name, Policy Type: P&I Club / H&M / War Risk / Loss of Hire, Insurer, Insured Limit, Deductible, Expiry Date).

---

## ⚡ Cascading Multi-Dimension Filter Engine

Top-level persistent filter bar supporting real-time reactive scoping:
- 🏢 **Organization Filter**: Filter all entities by parent tenant organization.
- 🚢 **Fleet Type Filter**: Filter entities by fleet type (Tanker, Dry Bulk, Gas, Container).
- ⚓ **Ship / Vessel Filter**: Filter entities by specific IMO vessel profile.
- 📜 **Contract Fixture Filter**: Filter by Time Contracts, Voyage Contracts, or specific fixture ID.
- 📅 **Date Range Filter**: Filter active contracts, master instructions, and insurance policies by Date From & Date To.
- 👤 **Role Perspective Chips**: Perspective switching across Master, Charterer, Ship Owner, Operations Manager, and Insurer views.
- 🧹 **Clear All Filters**: 1-click button to reset all filter parameters.

---

## 🛠️ Local Development & Quickstart

### Prerequisites
- Node.js 18+ installed
- Docker (optional)

### Setup & Run locally
```bash
# Clone the repository
git clone https://github.com/tegritytec/Tegrity-Voyage-Managemdnt.git
cd Tegrity-Voyage-Managemdnt

# Install dependencies
npm install

# Start local server (Runs on Port 8082)
npm start
```
Open [http://localhost:8082](http://localhost:8082) in your web browser.

---

## 📦 Containerization & Deployment

### Build & Run Docker Container
```bash
docker build -t tegrity-tvm-web .
docker run -p 8082:8082 tegrity-tvm-web
```

### Deploy to Google Cloud Run
```bash
gcloud run deploy tegrity-tvm-web \
  --source . \
  --region us-central1 \
  --project voyageiq-dev \
  --allow-unauthenticated
```

---

© 2026 TegrityTec Shipping Pte. Ltd. All rights reserved.
