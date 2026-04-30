import { env } from './lib/env'
import './App.css'

function App() {
  return (
    <main id="app-shell">
      <section className="status-card">
        <p className="eyebrow">Tic Tac Arena</p>
        <h1>Supabase foundation is connected</h1>
        <p className="lead">
          The web app is now reading its local Supabase configuration and is
          ready for the authentication layer.
        </p>

        <dl className="status-grid">
          <div>
            <dt>Connection target</dt>
            <dd>{env.supabaseUrl}</dd>
          </div>
          <div>
            <dt>Client key</dt>
            <dd>Configured through local environment</dd>
          </div>
          <div>
            <dt>Next step</dt>
            <dd>Google sign-in with Supabase Auth</dd>
          </div>
        </dl>
      </section>
    </main>
  )
}

export default App
