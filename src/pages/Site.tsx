import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const Site = () => {
  const { slug } = useParams<{ slug: string }>();
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSite = async () => {
      if (!slug) {
        setError("Invalid site URL");
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("deployed_sites")
        .select("html_content")
        .eq("slug", slug)
        .maybeSingle();

      if (fetchError) {
        console.error("Error fetching site:", fetchError);
        setError("Failed to load site");
        setLoading(false);
        return;
      }

      if (!data) {
        setError("Site not found");
        setLoading(false);
        return;
      }

      setHtmlContent(data.html_content);
      setLoading(false);
    };

    fetchSite();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <iframe
      srcDoc={htmlContent || ""}
      className="w-full h-screen border-0"
      sandbox="allow-scripts allow-same-origin"
      title="Deployed Site"
    />
  );
};

export default Site;
