# Lifelines — High-Level Scope
## A Community Lifelines Reporting Platform
## `lifelines.community` → powered by WatchOffice

**Version:** 0.2 — Reframed  
**Date:** 2026-04-15  
**Author:** ATLAS  
**Status:** DRAFT — Awaiting Roy's review

---

## The Problem

FEMA built the Community Lifelines framework (NRF 4th Edition, Toolkit 2.1) as a common language for incident reporting — any community, any hazard, any level of government. The construct works. The *tooling* doesn't exist.

**What FEMA delivered:**
- A framework (8 lifelines, 32 components, 100+ subcomponents)
- A color classification system (Green/Yellow/Red)
- A reporting structure (Status → Impact → Actions → Limiting Factors → ETA to Green)
- PDFs, fact sheets, icons, training slides

**What FEMA did NOT deliver:**
- A digital reporting tool any local EM can actually use
- A roll-up mechanism from local → county → state → region → national
- Automated data feeds that populate lifeline status
- A way to see the national picture in real time

Every EOC in the country is supposed to report using Lifelines. Most do it in PowerPoint, Excel, or whiteboard markers. The ones who do it well built their own — D4H, WebEOC custom views, homegrown dashboards. There is no common digital implementation.

**That's the gap. We build the tool.**

---

## The Concept

**Lifelines is a free, public, AI-powered Community Lifelines reporting platform** that does what FEMA designed but never built:

1. **Any community can report lifeline status** using the standard FEMA framework
2. **Reports roll up** from local → county → state → FEMA region → national
3. **WatchOffice feeds populate baseline status automatically** — NWS alerts, fire activity, power outages, fuel disruptions, road closures, public health alerts
4. **Local EMs validate and refine** what the automation produces
5. **The national picture is always visible** — anyone can see which lifelines are disrupted, where, and why

**The pitch:** "The lifelines reporting tool FEMA designed. Built for every community."

---

## FEMA Community Lifelines Framework (Complete)

### 8 Lifelines · 32 Components · 100+ Subcomponents

| # | Lifeline | Components |
|---|----------|------------|
| 1 | **Safety & Security** | Law Enforcement/Security · Fire Service · Search & Rescue · Government Service · Community Safety |
| 2 | **Food, Hydration & Shelter** | Food · Hydration · Shelter · Agriculture |
| 3 | **Health & Medical** | Medical Care · Public Health · Fatality Management · Medical Supply Chain · Patient Movement |
| 4 | **Energy** | Power Grid · Fuel |
| 5 | **Communications** | Infrastructure · Responder Communications · 911 & Dispatch · Finance · Alerts, Warnings & Messages |
| 6 | **Transportation** | Highway/Roadway/Motor Vehicle · Mass Transit · Railway · Maritime · Aviation |
| 7 | **Hazardous Material** | Facilities · HAZMAT, Pollutants, Contaminants |
| 8 | **Water Systems** | Potable Water Infrastructure · Wastewater Management |

### Subcomponents (examples by lifeline)

**Safety & Security:** Police stations, law enforcement, site security, correctional facilities, fire stations, firefighting resources, local SAR, EOCs, essential government functions, government offices, schools, public records, historic/cultural resources, flood control, other hazards, protective actions

**Food, Hydration & Shelter:** Commercial food distribution, food supply chain, food banks, bottled water distribution, commercial water supply chain, housing, shelters, commercial facilities (hotels), animals & agriculture

**Health & Medical:** Hospitals, dialysis, pharmacies, long-term care, VA health, veterinary services, home care, health surveillance, human services, behavioral health, vector control, labs, mortuary services, blood/blood products, pharmaceutical devices, medical gases, EMS

**Energy:** Generation systems, transmission systems, distribution systems, refineries/fuel processing, fuel storage, pipelines, fuel distribution (gas stations), offshore oil platforms

**Communications:** Wireless, cable/wireline, broadcast (TV/radio), satellite, data centers/internet, LMR networks, PSAPs, dispatch, banking services, electronic payment processing, local alert/warning, IPAWS (WEA, EAS, NWR), NAWAS terminals

**Transportation:** Roads, bridges, bus, rail, ferry, freight rail, passenger rail, waterways, ports, commercial aviation, general aviation, military aviation

**Hazardous Material:** Hazmat facilities, hazmat/pollutants/contaminants

**Water Systems:** Intake, treatment, storage, distribution (potable), collection, storage, treatment, discharge (wastewater)

### Color Classification (FEMA Standard)

| Color | Meaning |
|-------|---------|
| 🟢 **Green** | Lifeline is functional. Services operating within normal parameters. |
| 🟡 **Yellow** | Lifeline is impacted. Challenges exist but services are degraded, not failed. Workarounds or contingencies may be in place. |
| 🔴 **Red** | Lifeline is disrupted. Severe challenges or complete failure of essential services. Decisive intervention required. |

### FEMA Assessment Structure

| Field | Question |
|-------|----------|
| **Status** | What? (Green/Yellow/Red + narrative) |
| **Impact** | So what? (Community impact statement) |
| **Actions** | Now what? (Response/recovery actions underway) |
| **Limiting Factors** | What's the gap? (Resources, access, coordination) |
| **ETA to Green** | When? (Estimated restoration timeline) |

---

## Architecture

### Three Layers

```
┌─────────────────────────────────────────────────┐
│           NATIONAL LIFELINES DASHBOARD          │
│     Aggregated view · All states · All hazards  │
│         lifelines.community                      │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ FEMA R1  │  │ FEMA R4  │  │ FEMA R9  │ ... │
│  │ Regional │  │ Regional │  │ Regional │     │
│  │ Roll-up  │  │ Roll-up  │  │ Roll-up  │     │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘     │
│       │              │              │           │
│  ┌────┴────┐   ┌────┴────┐   ┌────┴────┐      │
│  │ State   │   │ State   │   │ State   │      │
│  │ Roll-up │   │ Roll-up │   │ Roll-up │      │
│  └────┬────┘   └────┬────┘   └────┬────┘      │
│       │              │              │           │
│  ┌────┴────┐   ┌────┴────┐   ┌────┴────┐      │
│  │ County/ │   │ County/ │   │ County/ │      │
│  │ Local   │   │ Local   │   │ Local   │      │
│  │ Reports │   │ Reports │   │ Reports │      │
│  └─────────┘   └─────────┘   └─────────┘      │
│                                                 │
├─────────────────────────────────────────────────┤
│            WATCHOFFICE DATA FEEDS               │
│  NWS · NIFC · PowerOutage · DOT · CDC · EPA    │
│  Automated baseline → Human-validated status     │
└─────────────────────────────────────────────────┘
```

### Layer 1: WatchOffice Automated Feeds (the foundation)

WatchOffice already monitors these data sources. Map each to the lifeline/component it affects:

| Data Source | Lifeline(s) Affected | Component(s) |
|-------------|---------------------|---------------|
| NWS Alerts (watches, warnings, advisories) | Safety & Security, Transportation | Community Safety, Highway/Roadway |
| NIFC/InciWeb (wildfire) | Safety & Security, Energy, Transportation | Fire Service, Power Grid, Highway/Roadway |
| PowerOutage.us | Energy | Power Grid (Distribution) |
| USGS ShakeMap/Earthquake | All lifelines | Cross-cutting |
| FEMA Disaster Declarations | All lifelines | Cross-cutting (triggers activation) |
| Drought Monitor | Food/Hydration/Shelter, Water Systems, Energy | Hydration, Agriculture, Potable Water, Fuel |
| EPA AirNow / PFAS alerts | Hazardous Material, Health & Medical | HAZMAT, Public Health |
| CDC Health Alerts | Health & Medical | Public Health, Medical Care |
| DOT/511 Road Closures | Transportation | Highway/Roadway, Bridges |
| USCG Port Status | Transportation | Maritime, Ports |
| FAA NOTAM/TFR | Transportation | Aviation |
| GasBuddy/EIA Fuel data | Energy | Fuel Distribution |

**This is the "WatchOffice as output" layer.** The same data ATLAS watch officers already collect and analyze flows into structured lifeline status reports — automatically. No human has to start from scratch.

### Layer 2: Local/State Reporting (the human layer)

- **Local EM logs in** → sees their jurisdiction's lifeline status pre-populated by WatchOffice data
- **Validates or adjusts** each component: "Power Grid shows Yellow from outage data, but that was restored 2 hours ago — updating to Green"
- **Adds narrative** using FEMA's assessment structure (Impact, Actions, Limiting Factors, ETA to Green)
- **County/state emergency managers** see roll-ups of their jurisdictions
- **State EOC** gets a single-view dashboard of all counties
- Reporting timestamps, edit history, accountability

### Layer 3: National Dashboard (the product)

- **Public-facing** — anyone can view the national lifelines status
- **Drill down:** National → FEMA Region → State → County/Jurisdiction
- **Color-coded map** with lifeline status overlays
- **Incident-specific views** — filter by active disaster/event
- **Historical** — archive of lifeline status over time (after-action value)
- **Exportable** — PDF/CSV for inclusion in SITREPs, IAPs, ESF reports

---

## WatchOffice Integration

This is where it gets powerful. The WatchOffice architecture Roy already approved (local → regional → national, bottom-up validated signal) maps directly to the Lifelines roll-up model:

| WatchOffice Layer | Lifelines Layer |
|-------------------|-----------------|
| State agents (54) | County/local lifeline feed population |
| Regional watch officers (12) | FEMA Region roll-up validation |
| National watch office (ATLAS) | National dashboard synthesis |

**The WatchOffice isn't feeding Lifelines. The WatchOffice IS the Lifelines reporting engine.** Same data, same architecture, same flow — output as a structured Community Lifelines status board instead of (or in addition to) narrative SITREPs.

---

## Revenue Model

### Free Tier (the pull)
- View national/state lifeline status — anyone, no account
- This is the "daily check" tool that gets EMs coming back
- Establishes Grey Sky as the authoritative source for lifeline status

### Grey Sky Member Tier ($10/mo or $100/yr)
- Report lifeline status for your jurisdiction
- Edit/validate WatchOffice-populated data
- Historical dashboard access
- Custom alerts ("notify me when Energy goes Red in my county")
- Export/reporting tools

### Agency/Organization Tier (custom pricing)
- Multi-user reporting for EOC teams
- Branded roll-ups for county/state EM agencies
- API access for integration with WebEOC, D4H, etc.
- White-label option for state emergency management agencies
- Training/implementation support

### The Strategic Play
This positions Grey Sky as **the national implementation partner for FEMA's own framework.** When FEMA finishes the 2024 doctrine update and wants to see consistent Lifelines reporting across SLTT — Grey Sky already built it. The platform becomes:
- A Grey Sky membership driver (reporters need accounts)
- A credentialing/certification tie-in (who are the people reporting? What are their qualifications?)
- A demonstration of AI-augmented emergency management (WatchOffice automation)
- A potential federal contract vehicle (tool adoption by FEMA regions or state EMAs)

---

## Relationship to Grey Sky

Lifelines is **a section within `greysky.dev`** and **a standalone domain** (`lifelines.community`):

- `lifelines.community` → `greysky.dev/lifelines` (redirect or proxy)
- Lifeline reporting requires Grey Sky membership (free to view, member to report)
- RTLT positions/team types mapped to lifelines they support (cross-reference)
- Member profiles show "Lifelines I protect" — identity layer
- Responder stories tagged by lifeline (content/community tie-in from original scope)

The community/content layer from v0.1 still exists — it's just not the lead. **The tool is the lead. The community grows around the tool.**

---

## Build Phases

### Phase 1 — Data Model + Static Dashboard
- Lifeline/component/subcomponent data model (Supabase tables or static data)
- National dashboard page with 8 lifeline cards showing status
- Drill-down to component level
- Map existing WatchOffice feed sources to lifelines
- Static/seed data to demonstrate the UI — not yet live
- **Build location:** `greysky.dev/lifelines`

### Phase 2 — WatchOffice Feed Integration
- WatchOffice SITREP data mapped to lifeline components
- Automated status population from existing feeds (NWS, fire, power, drought)
- Color classification logic (rules engine: which feed conditions = Yellow vs Red)
- Auto-refresh on WatchOffice cycle
- National dashboard goes live with real data

### Phase 3 — Reporting Interface
- Member login to report/validate lifeline status for their jurisdiction
- FEMA assessment structure form (Status, Impact, Actions, Limiting Factors, ETA)
- Jurisdiction selection (county/city/tribal)
- Edit history and timestamps
- Roll-up aggregation logic (local → county → state → region → national)

### Phase 4 — Agency Features + API
- Multi-user organization accounts
- State/county dashboard views
- Export (PDF/CSV)
- API for WebEOC/D4H integration
- Alert/notification system
- Historical archive and after-action reporting

---

## Competitive Landscape

| Platform | What They Do | Gap |
|----------|-------------|-----|
| **D4H** | Incident management, has Lifelines extension | Paid, enterprise-focused, no public national view |
| **WebEOC** | EOC management platform | Expensive, requires implementation, no cross-jurisdiction roll-up |
| **NC4** | Situational awareness | Enterprise/government sales, not community-accessible |
| **FEMA.gov** | Publishes Lifelines framework | No tooling, no reporting platform |
| **Lifelines.community** | **Free national dashboard, AI-populated, community-reported, rolls up** | **Us** |

Nobody is doing this at the public/community level with automated data feeds.

---

## Success Metrics

1. **Adoption:** Number of jurisdictions actively reporting (target: 50 counties in Y1, 500 in Y3)
2. **Daily traffic:** EMs checking the national dashboard as a morning routine
3. **Membership conversion:** Reporters → Grey Sky members
4. **Agency contracts:** State EMAs or FEMA regions adopting as their Lifelines reporting tool
5. **Data authority:** Grey Sky becomes the cited source for national lifeline status

---

## Open Questions for Roy

1. **Scope of Phase 1:** Static demo with seed data, or push straight to live WatchOffice integration? Straight live intergration
2. **Jurisdiction granularity:** Start at county level, or support city/tribal from day one? As close to the most granular level we can...may be eveypolitical districts...Thoughts?
3. **FEMA relationship:** Should Grey Sky engage FEMA's Lifelines team during build, or ship first and present later? Ship First...I know them and they dont care...It was intended for state and locals to pick up.
4. **Domain strategy:** `lifelines.community` as standalone brand or always redirect to `greysky.dev/lifelines`? Always redirect. We need them to tie together.
5. **Agency pricing:** Build the free → member → agency tier from day one, or start free-only and add tiers later? Free, Member , agency, and organization (for custom builds).



---

*Built on the FEMA Community Lifelines framework (NRF 4th Edition, Toolkit v2.1, 2024 update). Grey Sky doesn't replace the framework — it implements it.*
