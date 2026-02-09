
import React, { useState, useEffect } from 'react';
import { User, SocialInsight } from './types';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [insights, setInsights] = useState<SocialInsight[]>([]);
  const [loading, setLoading] = useState(false);

  // Load mock data or local storage
  useEffect(() => {
    const savedInsights = localStorage.getItem('social_insights');
    if (savedInsights) {
      setInsights(JSON.parse(savedInsights));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('social_insights', JSON.stringify(insights));
  }, [insights]);

  const handleLogin = (userData: User) => {
    setLoading(true);
    // Simulate SSO delay
    setTimeout(() => {
      setUser(userData);
      setLoading(false);
    }, 1200);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const addInsight = (insight: SocialInsight) => {
    setInsights(prev => [insight, ...prev]);
  };

  const removeInsight = (id: string) => {
    setInsights(prev => prev.filter(i => i.id !== id));
  };

  if (!user) {
    return <Login onLogin={handleLogin} isLoading={loading} />;
  }

  return (
    <Dashboard 
      user={user} 
      onLogout={handleLogout} 
      insights={insights}
      addInsight={addInsight}
      removeInsight={removeInsight}
    />
  );
};

export default App;
