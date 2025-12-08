# Quick Start Guide

## 🚀 Start the Application

The application is already set up and ready to use! Follow these steps:

### 1. Start the Development Server

The server is currently running at: **http://localhost:3000**

If you need to restart it, run:
```powershell
npm run dev
```

### 2. Access the Application

Open your browser and navigate to: **http://localhost:3000**

### 3. Get Started

1. **Enter your email** on the landing page
2. **Click "Add Integration"** to connect your first platform
3. Choose from:
   - 🔷 **Jira** - Issues from Jira Cloud/Server
   - 🐙 **GitHub** - Issues and Pull Requests
   - 🦊 **GitLab** - Issues and Merge Requests
   - 🔵 **Azure DevOps** - Work Items
   - 🪣 **Bitbucket** - Issues and Pull Requests

### 4. Configure Your First Integration

Example for GitHub:
1. Click "Add Integration"
2. Select "GitHub"
3. Enter a connection name (e.g., "My GitHub")
4. Generate a Personal Access Token:
   - Go to GitHub Settings → Developer settings → Personal access tokens
   - Click "Generate new token (classic)"
   - Select scopes: `repo`, `read:user`
   - Copy the token
5. Paste the token and click "Add Integration"

### 5. Sync Tickets

Click the **"Sync"** button to fetch all your assigned tickets from connected platforms.

## 📚 Platform Setup Guides

### Jira
```
URL: https://your-domain.atlassian.net
Email: your-email@example.com
Token: Generate at https://id.atlassian.com/manage/api-tokens
```

### GitHub
```
Token: Settings → Developer settings → Personal access tokens
Scopes: repo, read:user
```

### GitLab
```
URL: https://gitlab.com (or your self-hosted URL)
Token: User Settings → Access Tokens
Scopes: read_api, read_user
```

### Azure DevOps
```
URL: https://dev.azure.com/your-org
Token: User Settings → Personal Access Tokens
Scopes: Work Items (Read)
```

### Bitbucket
```
Username: your-username
Password: Personal Settings → App passwords
Permissions: Repositories (Read), Pull requests (Read), Issues (Read)
```

## ✨ Features

- ✅ **Unified Dashboard** - See all tickets in one place
- ✅ **Real-time Sync** - Fetch latest updates
- ✅ **Advanced Filtering** - Search and filter by platform/status
- ✅ **Secure Storage** - Encrypted token management
- ✅ **Multiple Accounts** - Connect multiple instances per platform
- ✅ **Responsive Design** - Works on all devices

## 🔧 Useful Commands

```powershell
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Type checking
npm run type-check

# View database
npx prisma studio
```

## 🛠️ Troubleshooting

### Connection Failed
- Verify your API token is correct and not expired
- Check the base URL format (should include https://)
- Ensure required permissions are granted

### No Tickets Appearing
- Click the "Sync" button to fetch tickets
- Verify you have tickets assigned to you in the platform
- Check if the integration is enabled (toggle switch)

### Database Issues
```powershell
# Reset database
npx prisma db push --force-reset

# View database content
npx prisma studio
```

## 📝 Notes

- **Email-based Auth**: This demo uses email for user identification (stored in localStorage)
- **SQLite Database**: Default database is SQLite (can be changed to PostgreSQL)
- **Encrypted Tokens**: All API tokens are encrypted before storage
- **Auto-sync**: Tokens are validated when adding integrations

## 🎯 Next Steps

1. Add all your platforms
2. Sync tickets regularly
3. Use search and filters to find specific tickets
4. Click on tickets to open them in their original platform

## 💡 Tips

- Use the search bar to quickly find tickets by title or description
- Filter by platform to focus on specific tools
- Toggle integrations on/off without deleting them
- Check the dashboard for statistics and recent tickets

---

**Enjoy using Ticket Aggregator! 🎉**
