-- Create table for product specifications
CREATE TABLE public.product_specifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.product_specifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Product specifications are viewable by everyone" 
ON public.product_specifications 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can insert product specifications" 
ON public.product_specifications 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update product specifications" 
ON public.product_specifications 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete product specifications" 
ON public.product_specifications 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_product_specifications_updated_at
BEFORE UPDATE ON public.product_specifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance on queries by product_id
CREATE INDEX idx_product_specifications_product_id ON public.product_specifications(product_id);
CREATE INDEX idx_product_specifications_display_order ON public.product_specifications(product_id, display_order);