-- Create table to store deployed sites
CREATE TABLE public.deployed_sites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT,
  code TEXT NOT NULL,
  html_content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS but allow public read access for deployed sites
ALTER TABLE public.deployed_sites ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read deployed sites (they are public by nature)
CREATE POLICY "Anyone can view deployed sites" 
ON public.deployed_sites 
FOR SELECT 
USING (true);

-- Allow anyone to create deployed sites (no auth required for MVP)
CREATE POLICY "Anyone can create deployed sites" 
ON public.deployed_sites 
FOR INSERT 
WITH CHECK (true);

-- Create index for faster slug lookups
CREATE INDEX idx_deployed_sites_slug ON public.deployed_sites(slug);