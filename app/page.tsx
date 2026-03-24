import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="landing">
      {/* Hero */}
      <section className="hero">
        <div className="hero-illustration">
          <Image
            src="/mountains.png"
            alt="Alpine mountain landscape"
            width={800}
            height={400}
            style={{ width: "100%", height: "auto", display: "block" }}
            priority
          />
        </div>

        <div className="hero-content">
          <h1 className="hero-title">Muesli</h1>
          <p className="hero-subtitle">
            AI meeting notes that feel like a fresh mountain morning.
          </p>
          <p className="hero-description">
            Record any conversation from any device. Get structured,
            actionable notes in seconds. No installs, no fuss.
          </p>

          <div className="hero-actions">
            <Link href="/dashboard" className="btn-primary">
              Get Started
            </Link>
          </div>

          <p className="hero-cost">
            Pay only for what you use — about $0.21 per meeting.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="features">
        <h2 className="features-title">How it works</h2>

        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Record</h3>
            <p>
              Open Muesli on any device — phone, laptop, tablet. Hit record.
              Your browser captures the audio directly. Nothing to install.
            </p>
          </div>

          <div className="step">
            <div className="step-number">2</div>
            <h3>Transcribe</h3>
            <p>
              Whisper turns your recording into a clean transcript.
              Handles accents, crosstalk, and background noise gracefully.
            </p>
          </div>

          <div className="step">
            <div className="step-number">3</div>
            <h3>Get Notes</h3>
            <p>
              Claude reads the transcript and generates structured notes:
              key decisions, action items, discussion summary — ready for Obsidian.
            </p>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="comparison">
        <h2 className="features-title">Why not Granola?</h2>
        <div className="comparison-table-wrap">
          <table className="comparison-table">
            <thead>
              <tr>
                <th></th>
                <th>Muesli</th>
                <th>Granola</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>30-min meeting cost</td>
                <td className="highlight">$0.21</td>
                <td>$19/mo flat</td>
              </tr>
              <tr>
                <td>Works on any device</td>
                <td className="highlight">Yes, browser-based</td>
                <td>Desktop app only</td>
              </tr>
              <tr>
                <td>In-person meetings</td>
                <td className="highlight">Yes</td>
                <td>No</td>
              </tr>
              <tr>
                <td>Open source</td>
                <td className="highlight">Yes</td>
                <td>No</td>
              </tr>
              <tr>
                <td>Your data stays yours</td>
                <td className="highlight">Yes</td>
                <td>Cloud-dependent</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>Powered by Whisper + Claude</p>
      </footer>
    </div>
  );
}
