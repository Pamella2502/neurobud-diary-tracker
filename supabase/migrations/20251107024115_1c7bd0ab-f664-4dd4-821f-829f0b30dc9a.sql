-- Create users table for additional user data and terms tracking
CREATE TABLE public.users (
  id UUID NOT NULL PRIMARY KEY,
  email TEXT NOT NULL,
  timezone TEXT NOT NULL,
  agreed_to_terms BOOLEAN NOT NULL DEFAULT FALSE,
  terms_agreed_at TIMESTAMP WITH TIME ZONE,
  terms_version TEXT,
  subscription_status TEXT NOT NULL DEFAULT 'trial',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view their own profile"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();