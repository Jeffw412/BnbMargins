# BnbMargins - Airbnb Profit & Loss Dashboard

A comprehensive Airbnb profit and loss dashboard built with Next.js, TypeScript, and Supabase. Track multiple properties, manage income and expenses, visualize performance with charts, and generate detailed reports.

## Features

- 🏠 **Multi-Property Management** - Add and manage multiple Airbnb properties
- 💰 **Income & Expense Tracking** - Detailed transaction management with categories
- 📊 **Interactive Dashboard** - Charts and visualizations for performance insights
- 📈 **Time-Based Analysis** - View data by week, month, year, or custom ranges
- 🔄 **Comparison Tools** - Compare periods and properties side-by-side
- 📄 **Report Generation** - Export detailed reports in PDF/Excel format
- 🎨 **Modern UI** - Clean, professional, high-tech design
- 🔐 **Secure Authentication** - User accounts with data isolation

## Tech Stack

- **Frontend**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Charts**: Recharts
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd BnbMargins
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure your Supabase project:
   - Create a new project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key to `.env.local`
   - Run the database migrations (coming soon)

5. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
src/
├── app/                 # Next.js app router pages
├── components/          # Reusable UI components
├── lib/                # Utility functions and configurations
├── types/              # TypeScript type definitions
└── hooks/              # Custom React hooks
```

## Development

This project uses:
- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety
- **Tailwind CSS** for styling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
