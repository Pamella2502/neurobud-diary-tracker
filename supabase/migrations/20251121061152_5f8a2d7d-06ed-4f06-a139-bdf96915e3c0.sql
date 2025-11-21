-- Create daily_summary table
CREATE TABLE IF NOT EXISTS public.daily_summary (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  child_id UUID NOT NULL,
  summary_date DATE NOT NULL,
  score NUMERIC(5,2) NOT NULL DEFAULT 0,
  evolution_status TEXT NOT NULL CHECK (evolution_status IN ('improved', 'regressed', 'neutral')),
  insights JSONB NOT NULL DEFAULT '[]'::jsonb,
  alerts JSONB NOT NULL DEFAULT '[]'::jsonb,
  comparison_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(child_id, summary_date)
);

-- Enable Row Level Security
ALTER TABLE public.daily_summary ENABLE ROW LEVEL SECURITY;

-- Create policies for daily_summary
CREATE POLICY "Users can view their own summaries"
ON public.daily_summary
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own summaries"
ON public.daily_summary
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own summaries"
ON public.daily_summary
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own summaries"
ON public.daily_summary
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_daily_summary_updated_at
BEFORE UPDATE ON public.daily_summary
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_daily_summary_child_date ON public.daily_summary(child_id, summary_date DESC);
CREATE INDEX idx_daily_summary_user_date ON public.daily_summary(user_id, summary_date DESC);