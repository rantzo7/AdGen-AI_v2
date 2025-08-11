import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';
import OnboardingModal from './components/OnboardingModal';
import CampaignWizard from './pages/CampaignWizard';
import AIChatbot from './components/AIChatbot'; // Import AIChatbot
import { supabase } from './supabaseClient';
import { CampaignData } from './types'; // Import CampaignData type
import { Bot } from 'lucide-react'; // Import Bot icon

function App() {
  const [session, setSession] = useState<any>(null);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showChatbot, setShowChatbot] = useState(false); // State for chatbot visibility
  const [campaignData, setCampaignData] = useState<CampaignData>({ // State for campaign data
    objective: null,
    ageRange: [18, 65],
    interests: [],
    adUrl: '',
    selectedImage: null,
    adCopies: [{ headline: '', primaryText: '' }],
  });

  const handleUpdateCampaignData = (data: Partial<CampaignData>) => {
    setCampaignData(prevData => ({ ...prevData, ...data }));
  };

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        if (session) {
          await checkOnboardingStatus(session.user.id);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing app:', error);
        setLoading(false);
      }
    };

    initializeApp();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        checkOnboardingStatus(session.user.id);
      } else {
        setOnboardingCompleted(false);
        setShowOnboarding(false);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkOnboardingStatus = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking onboarding status:', error);
    }

    if (data && data.onboarding_completed) {
      setOnboardingCompleted(true);
    } else {
      setOnboardingCompleted(false);
      setShowOnboarding(true);
    }
    setLoading(false);
  };

  const handleOnboardingComplete = async () => {
    if (session?.user?.id) {
      const { error } = await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', session.user.id);

      if (error) {
        console.error('Error updating onboarding status:', error);
      } else {
        setOnboardingCompleted(true);
        setShowOnboarding(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-primary-text dark:bg-gray-900 dark:text-gray-100">
        Loading application...
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  const renderPage = () => {
    if (!onboardingCompleted) {
      return (
        <OnboardingModal
          isOpen={showOnboarding}
          onClose={() => setShowOnboarding(false)}
          onComplete={handleOnboardingComplete}
        />
      );
    }

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'create-campaign':
        return <CampaignWizard />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background dark:bg-gray-900 dark:text-gray-100">
      <Sidebar setCurrentPage={setCurrentPage} />
      <main className="flex-1 p-8 flex flex-col">
        {renderPage()}
      </main>

      {/* Floating Action Button for Chatbot */}
      <button
        onClick={() => setShowChatbot(!showChatbot)}
        className="fixed bottom-8 right-8 bg-primary-brand text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-200 z-50 dark:bg-blue-600 dark:hover:bg-blue-700"
        title="Chat with AI Assistant"
      >
        <Bot size={28} />
      </button>

      <AIChatbot
        isOpen={showChatbot}
        onClose={() => setShowChatbot(false)}
        onCampaignDataUpdate={handleUpdateCampaignData}
        campaignData={campaignData}
      />
    </div>
  );
}

export default App;
