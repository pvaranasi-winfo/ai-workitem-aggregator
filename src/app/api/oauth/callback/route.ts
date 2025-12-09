import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const state = searchParams.get('state') // Can be used for CSRF protection

  if (error) {
    return new Response(`
      <html>
        <body>
          <script>
            window.opener?.postMessage({ error: '${error}', type: 'kantata-oauth' }, '*');
            window.close();
          </script>
          <p>Authorization failed: ${error}</p>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    })
  }

  if (code) {
    return new Response(`
      <html>
        <body>
          <script>
            window.opener?.postMessage({ code: '${code}', type: 'kantata-oauth' }, '*');
            window.close();
          </script>
          <p>Authorization successful! You can close this window.</p>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    })
  }

  return NextResponse.json({ error: 'No authorization code received' }, { status: 400 })
}