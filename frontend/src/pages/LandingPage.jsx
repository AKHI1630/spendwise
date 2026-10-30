import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp, ReceiptText, BarChart3, Target, Shield, Tag, Download,
} from 'lucide-react';
import './LandingPage.css';

const features = [
  {
    icon: <ReceiptText size={22} />,
    title: 'Track Expenses',
    desc: 'Record every transaction in seconds with an intuitive interface.',
  },
  {
    icon: <BarChart3 size={22} />,
    title: 'Smart Analytics',
    desc: 'Visualize spending patterns with beautiful, interactive charts.',
  },
  {
    icon: <Target size={22} />,
    title: 'Budget Goals',
    desc: 'Set monthly budgets and track your progress toward financial goals.',
  },
  {
    icon: <Shield size={22} />,
    title: 'Secure & Private',
    desc: 'Your data is protected with JWT authentication and secure encryption.',
  },
  {
    icon: <Tag size={22} />,
    title: 'Multiple Categories',
    desc: 'Organize transactions with 16+ categories for income and expenses.',
  },
  {
    icon: <Download size={22} />,
    title: 'Export Ready',
    desc: 'Your financial data, always accessible and ready to export.',
  },
];

const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      {/* Navbar */}
      <nav className={`landing-nav${scrolled ? ' scrolled' : ''}`}>
        <div className="landing-nav-inner">
          <Link to="/" className="landing-logo">
            <div className="landing-logo-icon">
              <TrendingUp size={20} />
            </div>
            <span className="landing-logo-text">SpendWise</span>
          </Link>

          <ul className="landing-nav-links">
            <li><a href="#features">Features</a></li>
            <li><a href="#about">About</a></li>
          </ul>

          <div className="landing-nav-actions">
            <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero">
        <div className="landing-hero-badge">
          <TrendingUp size={14} />
          Personal Finance Tracker
        </div>

        <h1>
          Your money.{' '}
          <span className="accent">Your clarity.</span>
          {' '}Your control.
        </h1>

        <p>
          SpendWise helps you track income and expenses, understand your spending habits,
          and make smarter financial decisions every day.
        </p>

        <div className="landing-hero-ctas">
          <Link to="/register" className="btn btn-primary btn-lg">
            Get Started for Free
          </Link>
          <a href="#features" className="btn-ghost-outline">
            See How It Works
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="landing-features" id="features">
        <div className="landing-section-header">
          <h2>Everything you need to manage your finances</h2>
          <p>All the tools to help you understand, track, and improve your financial health.</p>
        </div>
        <div className="features-grid">
          {features.map((f) => (
            <div className="feature-card" key={f.title}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="landing-cta" id="about">
        <h2>Ready to take control of your finances?</h2>
        <p>Join thousands of users who are making smarter money decisions with SpendWise.</p>
        <Link to="/register" className="btn btn-primary btn-lg">
          Get Started for Free
        </Link>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <Link to="/" className="landing-logo" style={{ textDecoration: 'none' }}>
            <div className="landing-logo-icon" style={{ width: 28, height: 28, borderRadius: 8 }}>
              <TrendingUp size={15} />
            </div>
            <span style={{ fontWeight: 700, fontSize: 15 }}>SpendWise</span>
          </Link>
          <p className="landing-footer-copy">&#169; 2024 SpendWise. All rights reserved.</p>
          <div className="landing-footer-links">
            <a href="#features">Features</a>
            <a href="#about">About</a>
            <Link to="/login">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
