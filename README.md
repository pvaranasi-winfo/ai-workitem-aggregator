# Ticket Aggregator

A comprehensive full-stack application that integrates with multiple project management tools to collect and display user-assigned tickets in one unified dashboard. Built with Next.js, TypeScript, React, and featuring a stunning UI/UX experience.

![Ticket Aggregator](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue) ![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8)

## 🚀 Features

### Integrated Platforms
- **Jira** - Cloud and Server instances
- **GitHub** - Issues and Pull Requests
- **GitLab** - Issues and Merge Requests (Cloud & Self-hosted)
- **Azure DevOps** - Work Items
- **Bitbucket** - Issues and Pull Requests

### Core Functionality
- ✅ **Multi-platform Integration** - Connect unlimited accounts from all supported platforms
- ✅ **Secure Token Management** - Encrypted storage of API tokens
- ✅ **Real-time Sync** - Fetch latest tickets from all integrated platforms
- ✅ **Advanced Filtering** - Filter by platform, status, and search
- ✅ **Dashboard Analytics** - View statistics and insights
- ✅ **Responsive Design** - Works beautifully on all devices
- ✅ **Beautiful UI** - Modern design with Tailwind CSS and shadcn/ui
- ✅ **Type-Safe** - Full TypeScript implementation
- ✅ **Optimized Performance** - React Query for efficient data fetching

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn** or **pnpm**
- **Git**

## 🛠️ Installation & Setup

### 1. Clone or navigate to the project

```powershell
cd c:\ai_user_ts
```

### 2. Install dependencies

```powershell
npm install
```

### 3. Choose Your Database

#### Option A: PostgreSQL with Docker (Recommended)

**Quick automated setup:**
```powershell
.\setup-postgres.ps1
```

**Manual setup:**
```powershell
cd database
.\scripts\start-docker.ps1
cd ..
```

Then update `.env`:
```env
DATABASE_URL="postgresql://ticketuser:ticketpass123@localhost:5432/ticket_aggregator"
```

#### Option B: Local PostgreSQL

```powershell
cd database
.\scripts\setup-local-postgres.ps1
cd ..
```

Follow the prompts and update `.env` with your credentials.

#### Option C: SQLite (Development Only)

Create `.env` file:
```env
DATABASE_URL="file:./dev.db"
```

### 4. Initialize the database

```powershell
npx prisma generate
npx prisma db push
```

### 5. Start the development server

```powershell
npm run dev
```

The application will be available at `http://localhost:3000`

## 📖 Usage Guide

### Getting Started

1. **Enter your email** on the landing page
2. **Add integrations** by clicking "Add Integration"
3. **Configure each platform** with your credentials
4. **Sync tickets** to fetch your assigned items
5. **View and filter** tickets across all platforms

### Adding Platform Integrations

#### Jira
1. Get your API token from: https://id.atlassian.com/manage/api-tokens
2. Enter your Jira instance URL (e.g., `https://your-domain.atlassian.net`)
3. Provide your email and API token

#### GitHub
1. Generate a Personal Access Token: Settings > Developer settings > Personal access tokens
2. Required scopes: `repo`, `read:user`
3. Enter the token in the integration dialog

#### GitLab
1. Generate a Personal Access Token: User Settings > Access Tokens
2. Required scopes: `read_api`, `read_user`
3. For self-hosted, enter your GitLab URL

#### Azure DevOps
1. Create a PAT: User Settings > Personal Access Tokens
2. Required scopes: Work Items (Read)
3. Enter your organization URL (e.g., `https://dev.azure.com/your-org`)

#### Bitbucket
1. Create an App Password: Personal Settings > App passwords
2. Required permissions: Repositories (Read), Pull requests (Read), Issues (Read)
3. Enter your Bitbucket username and app password

## 📊 Database Options

### PostgreSQL (Production Ready)
- **Docker Setup**: See `database/README.md`
- **Scripts**: `database/scripts/`
- **Migration Guide**: `MIGRATE_TO_POSTGRES.md`

### SQLite (Development)
- Simple file-based database
- No additional setup required
- Good for local development

Choose PostgreSQL for production deployments.

```
c:\ai_user_ts\
├── src/
│   ├── app/                      # Next.js app directory
│   │   ├── api/                  # API routes
│   │   │   ├── dashboard/        # Dashboard statistics
│   │   │   ├── integrations/     # Integration management
│   │   │   ├── tickets/          # Ticket fetching and sync
│   │   │   └── users/            # User management
│   │   ├── dashboard/            # Dashboard page
│   │   ├── integrations/         # Integrations management page
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Landing page
│   │   ├── providers.tsx         # React Query provider
│   │   └── globals.css           # Global styles
│   ├── components/               # React components
│   │   ├── ui/                   # Base UI components (shadcn/ui)
│   │   ├── add-integration-dialog.tsx
│   │   ├── integration-card.tsx
│   │   └── ticket-card.tsx
│   ├── lib/                      # Utilities and integrations
│   │   ├── integrations/         # Platform API clients
│   │   │   ├── jira.ts
│   │   │   ├── github.ts
│   │   │   ├── gitlab.ts
│   │   │   ├── azure-devops.ts
│   │   │   ├── bitbucket.ts
│   │   │   └── index.ts
│   │   ├── crypto.ts             # Encryption utilities
│   │   ├── db.ts                 # Prisma client
│   │   ├── platforms.ts          # Platform configurations
│   │   └── utils.ts              # Helper functions
│   └── types/                    # TypeScript type definitions
│   └── index.ts
├── prisma/
│   └── schema.prisma             # Database schema (PostgreSQL)
├── database/                     # Database setup files
├── public/                       # Static assets
├── .env                          # Environment variables
├── .env.example                  # Environment template
├── .env.postgres                 # PostgreSQL env template
├── .gitignore
├── next.config.js
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## 🔧 API Endpoints

### Users
- `GET /api/users?email={email}` - Get or create user

### Integrations
- `GET /api/integrations?email={email}` - List integrations
- `POST /api/integrations` - Create integration
- `PATCH /api/integrations` - Update integration
- `DELETE /api/integrations?id={id}` - Delete integration

### Tickets
- `GET /api/tickets?email={email}&platform={platform}&search={query}` - List tickets
- `POST /api/tickets/sync` - Sync tickets from all active integrations

### Dashboard
- `GET /api/dashboard?email={email}` - Get dashboard statistics

## 🎨 Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **React Query** - Server state management
- **Tailwind CSS** - Utility-first CSS
- **shadcn/ui** - Beautiful UI components
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **Framer Motion** - Animations
- **Sonner** - Toast notifications

### Backend
- **Next.js API Routes** - Serverless API
- **Prisma** - Database ORM
- **SQLite** - Database (can be switched to PostgreSQL)
- **Axios** - HTTP client
- **Crypto** - Token encryption

### Platform APIs
- Jira REST API v3
- GitHub REST API v3
- GitLab API v4
- Azure DevOps REST API v7.0
- Bitbucket Cloud REST API v2.0

## 🔒 Security

- **Token Encryption**: All API tokens are encrypted using AES-256-CBC before storage
- **No Password Storage**: Only encrypted tokens are stored
- **Secure API Calls**: All platform APIs are accessed over HTTPS
- **Environment Variables**: Sensitive data stored in environment variables

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

### Docker

```powershell
# Build image
docker build -t ticket-aggregator .

# Run container
docker run -p 3000:3000 ticket-aggregator
```

## 📝 Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Database connection string (PostgreSQL or SQLite) | Yes |
| `NEXT_PUBLIC_APP_URL` | Application URL | Yes |
| `ENCRYPTION_KEY` | Secret key for token encryption | Yes |

### PostgreSQL Example:
```env
DATABASE_URL="postgresql://ticketuser:ticketpass123@localhost:5432/ticket_aggregator"
```

### SQLite Example:
```env
DATABASE_URL="file:./dev.db"
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Prisma](https://www.prisma.io/)
- [React Query](https://tanstack.com/query)

## 💡 Future Enhancements

- [ ] Multi-user authentication
- [ ] Team collaboration features
- [ ] Custom ticket views and boards
- [ ] Email notifications
- [ ] Mobile app
- [ ] Additional platform integrations (Linear, Asana, Trello, etc.)
- [ ] Advanced analytics and reporting
- [ ] Export functionality
- [ ] Webhook support for real-time updates

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ using Next.js, TypeScript, and modern web technologies**
