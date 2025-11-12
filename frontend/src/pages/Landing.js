import React from "react";
import { Link, useNavigate } from "react-router-dom";

function Landing() {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem("token");

  const handleGetStarted = () => {
    if (isLoggedIn) {
      navigate("/feed");
    } else {
      navigate("/register");
    }
  };

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="gradient-text">🌐 Welcome to Connectify</span>
          </h1>
          <p className="hero-subtitle">
            Connect with friends, share your moments, and discover amazing content
          </p>
          <div className="hero-buttons">
            <button onClick={handleGetStarted} className="cta-button primary">
              🚀 Get Started
            </button>
            {!isLoggedIn && (
              <Link to="/login">
                <button className="cta-button secondary">
                  🔐 Login
                </button>
              </Link>
            )}
          </div>
        </div>
        <div className="hero-emoji">
          <span className="floating-emoji">🎉</span>
          <span className="floating-emoji">💬</span>
          <span className="floating-emoji">🌟</span>
          <span className="floating-emoji">❤️</span>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <h2 className="section-title gradient-text">✨ Amazing Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📰</div>
            <h3>Social Feed</h3>
            <p>Share your thoughts and stay updated with your friends' posts</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h3>Real-time Chat</h3>
            <p>Chat instantly with your connections using our real-time messaging</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👤</div>
            <h3>Custom Profiles</h3>
            <p>Create and personalize your profile to express yourself</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>Discover</h3>
            <p>Explore trending content and find new interesting people</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Analytics</h3>
            <p>Track your engagement and growth with detailed insights</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔔</div>
            <h3>Notifications</h3>
            <p>Never miss important updates from your network</p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-section">
        <h2 className="section-title gradient-text">📈 Join Our Growing Community</h2>
        <div className="stats-row">
          <div className="stat-item">
            <div className="stat-number">1000+</div>
            <div className="stat-text">Active Users</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">5000+</div>
            <div className="stat-text">Posts Shared</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">10000+</div>
            <div className="stat-text">Messages Sent</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">50+</div>
            <div className="stat-text">Countries</div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="about-section">
        <h2 className="section-title gradient-text">ℹ️ About Connectify</h2>
        <div className="about-content">
          <p>
            Connectify is a modern social networking platform designed to bring people together.
            Built with cutting-edge technology, we provide a seamless and engaging experience
            for users to connect, share, and grow their network.
          </p>
          <p>
            Our mission is to create meaningful connections in a colorful, user-friendly
            environment where everyone can express themselves freely and discover amazing content.
          </p>
        </div>
      </div>

      {/* CTA Section */}
      <div className="cta-section">
        <h2 className="gradient-text">Ready to Join?</h2>
        <p>Start your journey with Connectify today!</p>
        <button onClick={handleGetStarted} className="cta-button primary large">
          🎯 Create Your Account
        </button>
      </div>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <p>© 2025 Connectify. Made with ❤️ for connecting people.</p>
          <div className="footer-links">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
            <a href="#contact">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
