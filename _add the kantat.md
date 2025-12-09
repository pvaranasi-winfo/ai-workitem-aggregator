<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# suggest a prompt for the following

add the kantata website into the "Add  integration" tab and ask for the neccessry details to loginn to kantata to get all the data

```
Create a new "Add Integration" tab/page in my [React/Angular] web app with Kantata integration.

Requirements:
1. Add tab navigation: "Add Integration" tab containing integration cards/list. Include "Kantata" card with icon, title "Connect Kantata (Workspaces, Tasks, Time Entries)", and "Connect" button.

2. On "Connect" click: Open modal/form asking for necessary Kantata login details:
   - Client ID (text input, required)
   - Client Secret (password input, required) 
   - Account Subdomain (e.g., "yourcompany.mavenlink.com")
   - Optional: Redirect URI (pre-fill with current origin + /oauth/callback)

3. "Authorize Kantata" button triggers OAuth2 flow:
   - Construct auth URL: https://[subdomain].mavenlink.com/oauth/authorize?client_id=[id]&response_type=code&redirect_uri=[uri]
   - Open in popup/new tab, handle callback to extract 'code'
   - POST to https://[subdomain].mavenlink.com/oauth/token to exchange code for bearer token
   - Store token securely (localStorage + encryption or backend)

4. After success: Show success message "Kantata connected!" with test button that fetches:
   - GET https://api.mavenlink.com/api/v1/workspaces.json (Authorization: Bearer [token])
   - Display preview: workspace names, task counts, recent time entries in cards/table

5. Integration management: Show connected integrations list with "Kantata" status, refresh data button, disconnect option (clear token).

6. Components needed:
   - IntegrationTabs component with AddIntegrationTab
   - KantataIntegrationCard 
   - KantataAuthModal with form validation
   - KantataDataPreview with loading/error states
   - useKantataAuth hook for token management/API calls

7. Error handling: Invalid credentials, network errors, token expired (auto-refresh if refresh_token available).
8. Responsive design, TypeScript interfaces, React Query for data fetching/caching.

Generate complete code with all components, hooks, API service, and tab routing. Use Tailwind/Material-UI for styling.
```

Replace `[React/Angular]` with your framework. This creates a professional integration tab where users enter Kantata app credentials (from their Kantata admin settings) and connects to fetch all work data automatically.

