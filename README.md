# EdTech Compliance Assessment Tool

A professional web application that helps educational technology companies identify which regulations apply to them and receive a personalized compliance roadmap.

## Overview

This tool is designed for cybersecurity strategy consultants, compliance officers, and edtech company executives who need to navigate the complex regulatory landscape including FERPA, COPPA, SOPPA, state privacy laws, GDPR, and more.

## Features

### 🎯 Interactive Assessment
- 15 strategic questions covering:
  - Student age groups served (K-12, higher ed, adult learning)
  - Types of data collected (PII, educational records, behavioral data)
  - Geographic markets (US states, international)
  - Business model (B2B to schools, B2C to students/parents)
  - Data sharing and privacy practices

### 🔍 Real-Time Compliance Detection
- Visual indicators showing which regulations are triggered as you answer
- Priority-based badges (Critical, High, Medium)
- Live updates during assessment

### 📋 Personalized Compliance Roadmap
- Priority matrix showing critical vs. important requirements
- Specific, actionable recommendations for each triggered regulation
- Timeline/phases for implementation (Immediate, Short-term, Medium-term, Long-term)
- Effort estimates (Low, Medium, High) for each recommendation

### 📊 Professional Visualizations
- Compliance priority distribution chart
- Clean, modern UI with professional design
- Responsive design for desktop and tablet

### 📄 PDF Export
- Export complete assessment results as PDF report
- Shareable with stakeholders and compliance teams

## Regulations Covered

### Federal Regulations
- **FERPA** - Family Educational Rights and Privacy Act (Student Education Records)
- **COPPA** - Children's Online Privacy Protection Act (Children Under 13)

### State Regulations
- **SOPIPA** - Student Online Personal Information Protection Act (California)
- **NY Education Law 2-d** - New York Student Data Privacy
- **CCPA/CPRA** - California Consumer Privacy Act

### International
- **GDPR** - General Data Protection Regulation (European Union)

## Technology Stack

- **React 19** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Recharts** for data visualizations
- **jsPDF & html2canvas** for PDF export
- **Lucide React** for icons

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development

The application will be available at `http://localhost:5173` when running the dev server.

## Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # Reusable UI components (Button, Card, Badge, etc.)
│   ├── Questionnaire.tsx
│   ├── ComplianceIndicator.tsx
│   ├── Results.tsx
│   └── ComplianceChart.tsx
├── data/                # Data files
│   ├── questions.ts     # Assessment questions
│   └── regulations.ts   # Regulation details
├── types/               # TypeScript type definitions
│   └── index.ts
├── utils/               # Utility functions
│   └── complianceEngine.ts  # Compliance detection logic
├── lib/                 # Helper libraries
│   └── utils.ts
├── App.tsx             # Main application component
└── main.tsx            # Application entry point
```

## How It Works

1. **Assessment**: Users answer 15 questions about their edtech business
2. **Detection**: The compliance engine analyzes answers in real-time to detect applicable regulations
3. **Recommendations**: Based on answers, the system generates specific recommendations with:
   - Regulation-specific guidance
   - Priority level (immediate to long-term)
   - Effort estimates
   - Detailed action items
4. **Export**: Users can download a complete PDF report of their compliance roadmap

## Extensibility

The application is designed for easy extension:

- **Adding Regulations**: Add new regulations to `src/data/regulations.ts`
- **Adding Questions**: Add new questions to `src/data/questions.ts` with appropriate triggers
- **Custom Recommendations**: Extend the recommendation logic in `src/utils/complianceEngine.ts`

## Legal Disclaimer

This tool provides general guidance only and does not constitute legal advice. Consult with qualified legal counsel for compliance matters specific to your organization.

## License

Copyright © 2024. All rights reserved.

## Author

Built for cybersecurity strategy consultants at BCG specializing in edtech compliance.
