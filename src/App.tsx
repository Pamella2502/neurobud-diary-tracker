import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import CheckEmail from "./pages/CheckEmail";
import EmailVerified from "./pages/EmailVerified";
import ExpiredLink from "./pages/ExpiredLink";
import TermsOnboarding from "./components/TermsOnboarding";
import { OfflineIndicator } from "./components/OfflineIndicator";
import { SkipToContent } from "./components/SkipToContent";
import { AccessibilityProvider } from "./contexts/AccessibilityContext";
import { usePWAUpdate } from "./hooks/usePWAUpdate";
import type { Session } from "@supabase/supabase-js";

// Component wrapper to use navigate hook
const AppRoutes = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Initialize PWA update handling
  usePWAUpdate();

  // Detect verification errors from URL hash
  useEffect(() => {
    const detectVerificationError = () => {
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.substring(1));
      
      const error = params.get('error');
      const errorDescription = params.get('error_description');
      const errorCode = params.get('error_code');
      
      console.log('URL Hash params:', { error, errorDescription, errorCode });
      
      if (error) {
        let errorType = 'expired';
        let email = '';
        
        // Try to get email from session storage or local storage
        try {
          email = localStorage.getItem('pending_verification_email') || '';
        } catch (e) {
          console.error('Error reading email from storage:', e);
        }
        
        // Detect error type
        if (errorDescription?.toLowerCase().includes('expired') || 
            errorDescription?.toLowerCase().includes('token') ||
            errorCode === '401') {
          errorType = 'expired';
        } else if (errorDescription?.toLowerCase().includes('invalid') ||
                   errorDescription?.toLowerCase().includes('malformed')) {
          errorType = 'invalid';
        } else if (errorDescription?.toLowerCase().includes('already') ||
                   errorDescription?.toLowerCase().includes('used')) {
          errorType = 'used';
        }
        
        console.log('Redirecting to expired-link with type:', errorType);
        
        // Clear the hash and redirect
        window.history.replaceState(null, '', window.location.pathname);
        navigate(`/expired-link?type=${errorType}${email ? `&email=${encodeURIComponent(email)}` : ''}`);
      }
    };
    
    detectVerificationError();
  }, [navigate]);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        setSession(session);
        
        if (session) {
          await fetchUserProfile(session.user.id);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        console.log('Auth event:', event);
        
        // Handle specific auth events
        if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed successfully');
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
        } else if (event === 'USER_UPDATED') {
          console.log('User updated');
        }
        
        setSession(session);
        setUserProfile(null);
        
        if (session) {
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching user profile:", error);
        // Se não houver perfil, criar um automaticamente
        if (error.code === 'PGRST116') {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            const { data: newProfile } = await supabase
              .from("users")
              .insert({
                id: userId,
                email: session.user.email || '',
                timezone: 'America/Sao_Paulo',
                agreed_to_terms: false
              })
              .select()
              .single();
            
            setUserProfile(newProfile);
          }
        }
      } else {
        setUserProfile(data);
      }
    } catch (error) {
      console.error("Unexpected error fetching user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading NeuroBud...</p>
        </div>
      </div>
    );
  }

  // Check if user needs to accept terms
  if (session && userProfile && !userProfile.agreed_to_terms) {
    return <TermsOnboarding userId={session.user.id} />;
  }

  return (
    <>
      <SkipToContent />
      {loading ? (
        <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center">
          <div className="text-center">
            <div 
              className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"
              role="status"
              aria-label="Loading application"
            ></div>
            <p className="text-muted-foreground">Loading NeuroBud...</p>
          </div>
        </div>
      ) : session && userProfile && !userProfile.agreed_to_terms ? (
        <TermsOnboarding userId={session.user.id} />
      ) : (
        <main id="main-content" role="main">
          <Routes>
            <Route path="/" element={session ? <Navigate to="/dashboard" /> : <Landing />} />
            <Route path="/auth" element={session ? <Navigate to="/dashboard" /> : <Auth />} />
            <Route path="/check-email" element={<CheckEmail />} />
            <Route path="/email-verified" element={<EmailVerified />} />
            <Route path="/expired-link" element={<ExpiredLink />} />
            <Route path="/dashboard" element={session ? <Dashboard /> : <Navigate to="/auth" />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      )}
    </>
  );
};

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AccessibilityProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <OfflineIndicator />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AccessibilityProvider>
    </QueryClientProvider>
  );
};

export default App;
