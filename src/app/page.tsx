'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

export default function Home() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate email exists in database via API call
      const response = await fetch(`/api/auth/validate?email=${encodeURIComponent(email)}`);
      if (response.ok) {
        localStorage.setItem('userEmail', email.toLowerCase());
        router.push('/dashboard');
        return;
      } else {
        alert('User not found. Please contact your administrator.');
        return;
      }
      
      // Store email in localStorage for demo purposes
      localStorage.setItem('userEmail', email)
      router.push('/dashboard')
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Ticket Aggregator
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect all your project management tools in one unified dashboard.
            Track tickets from Jira, GitHub, GitLab, Azure DevOps, and Bitbucket effortlessly.
          </p>
        </div>

        <Card className="max-w-md mx-auto shadow-xl animate-slide-in">
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              Enter your email to access your unified ticket dashboard
            </CardDescription>
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800">
                <span className="font-semibold">Test Accounts:</span><br />
                Admin: <code className="bg-blue-100 px-1.5 py-0.5 rounded text-xs">admin@company.com</code><br />
                PM: <code className="bg-blue-100 px-1.5 py-0.5 rounded text-xs">sarah.johnson@company.com</code><br />
                Employee: <code className="bg-blue-100 px-1.5 py-0.5 rounded text-xs">john.doe@company.com</code>
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Loading...' : 'Continue to Dashboard'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-5 gap-6 mt-12 animate-slide-in">
          {[
            { name: 'Jira', icon: '🔷', color: 'from-blue-500 to-blue-600' },
            { name: 'GitHub', icon: '🐙', color: 'from-gray-700 to-gray-900' },
            { name: 'GitLab', icon: '🦊', color: 'from-orange-500 to-red-600' },
            { name: 'Azure DevOps', icon: '🔵', color: 'from-blue-600 to-blue-700' },
            { name: 'Bitbucket', icon: '🪣', color: 'from-blue-400 to-blue-500' },
          ].map((platform) => (
            <Card key={platform.name} className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div
                  className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-br ${platform.color} flex items-center justify-center text-3xl mb-2`}
                >
                  {platform.icon}
                </div>
                <p className="font-semibold">{platform.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
