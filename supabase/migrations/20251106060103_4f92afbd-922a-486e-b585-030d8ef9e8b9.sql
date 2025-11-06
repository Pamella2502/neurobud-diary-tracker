-- Create children table
CREATE TABLE IF NOT EXISTS public.children (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 0 AND age <= 18),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on children table
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;

-- RLS policies for children table
CREATE POLICY "Users can view their own children"
  ON public.children FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own children"
  ON public.children FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own children"
  ON public.children FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own children"
  ON public.children FOR DELETE
  USING (auth.uid() = user_id);

-- Create daily_records table
CREATE TABLE IF NOT EXISTS public.daily_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  record_date DATE NOT NULL,
  sleep_data JSONB DEFAULT '{}'::jsonb,
  mood_data JSONB DEFAULT '{}'::jsonb,
  nutrition_data JSONB DEFAULT '{}'::jsonb,
  medication_data JSONB DEFAULT '{}'::jsonb,
  activity_data JSONB DEFAULT '{}'::jsonb,
  crisis_data JSONB DEFAULT '{}'::jsonb,
  incident_data JSONB DEFAULT '{}'::jsonb,
  hyperfocus_data JSONB DEFAULT '{}'::jsonb,
  extra_notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(child_id, record_date)
);

-- Enable RLS on daily_records table
ALTER TABLE public.daily_records ENABLE ROW LEVEL SECURITY;

-- RLS policies for daily_records table
CREATE POLICY "Users can view their own records"
  ON public.daily_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own records"
  ON public.daily_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own records"
  ON public.daily_records FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own records"
  ON public.daily_records FOR DELETE
  USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_children_updated_at
  BEFORE UPDATE ON public.children
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_daily_records_updated_at
  BEFORE UPDATE ON public.daily_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();