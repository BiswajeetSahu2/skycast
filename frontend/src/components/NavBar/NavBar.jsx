import './NavBar.css';

export default function NavBar({
  isDark,
  toggleTheme,
  isFahrenheit,
  toggleUnit,
  activeTab,
  setActiveTab,
  hasResults,
  onLogoClick,
  searchSlot,
  user,
  onLoginClick,
  onSignupClick,
  onLogout
}) {
  const tabs = [
    ...(hasResults ? ['Today', 'Hourly'] : []),
    ...(user ? ['Favorites'] : []),
  ];

  return (
    <nav className="top-nav">

      <button
        className="nav-logo"
        onClick={onLogoClick}
        title="Back to home"
      >

        <svg
          className="nav-logo-icon"
          viewBox="0 0 64 64"
          fill="none"
        >

          <rect
            width="64"
            height="64"
            rx="14"
            fill="currentColor"
            opacity="0.12"
          />

          <ellipse
            cx="38"
            cy="26"
            rx="10"
            ry="8"
            fill="currentColor"
            opacity="0.85"
          />

          <ellipse
            cx="28"
            cy="29"
            rx="8"
            ry="6"
            fill="currentColor"
            opacity="0.85"
          />

          <rect
            x="20"
            y="29"
            width="28"
            height="8"
            fill="currentColor"
            opacity="0.85"
          />

          <line
            x1="27"
            y1="40"
            x2="24"
            y2="48"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.7"
          />

          <line
            x1="33"
            y1="40"
            x2="30"
            y2="48"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.7"
          />

          <line
            x1="39"
            y1="40"
            x2="36"
            y2="48"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.7"
          />

          <circle
            cx="46"
            cy="18"
            r="6"
            fill="#fbbf24"
            opacity="0.95"
          />

        </svg>

        <span className="nav-logo-text">

          <span className="nav-logo-sky">
            Sky
          </span>

          <span className="nav-logo-cast">
            Cast
          </span>

        </span>

      </button>

      {hasResults && (
        <div className="nav-search-wrap">
          {searchSlot}
        </div>
      )}

      {tabs.length > 0 && (
        <div className="nav-tabs">

          {tabs.map(tab => (

            <button
              key={tab}
              className={`nav-tab ${
                activeTab === tab.toLowerCase()
                  ? 'active'
                  : ''
              }`}
              onClick={() => setActiveTab(tab.toLowerCase())}
            >

              {tab}

            </button>

          ))}

        </div>
      )}

      <div className="nav-controls">
        {user ? (
          <>
            <span className="nav-user">{user.name}</span>
            <button className="nav-auth-btn" onClick={onLogout}>Logout</button>
          </>
        ) : (
          <>
            <button className="nav-auth-btn" onClick={onLoginClick}>Login</button>
            <button className="nav-auth-btn primary" onClick={onSignupClick}>Signup</button>
          </>
        )}

        <button
          className="nav-btn"
          onClick={toggleTheme}
          title="Toggle theme"
        >

          {isDark ? '☀️' : '🌙'}

        </button>

        <button
          className="nav-btn unit"
          onClick={toggleUnit}
          title="Toggle unit"
        >

          {isFahrenheit ? '°C' : '°F'}

        </button>

      </div>

    </nav>
  );
}
