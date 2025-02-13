import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = 'https://urguvlckmcehdiibsiwf.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function use3DTour(propertyId: string, isDemo: boolean) {
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false
    }
  });

  useEffect(() => {
    async function fetch3DTour() {
      try {
        setLoading(true);
        setError(null);
        
        if (isDemo) {
          // List contents of the 3d_tours folder
          const { data: tourContents, error: tourError } = await supabase
            .storage
            .from('property-assets')
            .list('demo/3d_tours', { limit: 100 });

          if (tourError) throw tourError;

          // Find the first GLB file
          const glbFile = tourContents?.find(item => item.name.toLowerCase().endsWith('.glb'));

          if (glbFile) {
            const filePath = `demo/3d_tours/${glbFile.name}`;
            const { data: { publicUrl }, error: urlError } = supabase
              .storage
              .from('property-assets')
              .getPublicUrl(filePath);

            if (urlError) throw urlError;

            console.log('Loading demo 3D tour:', {
              glbFile,
              filePath,
              publicUrl
            });

            const response = await fetch(publicUrl, { method: 'HEAD' });
            if (response.ok) {
              setModelUrl(publicUrl);
              return;
            }
          }

          throw new Error('Could not find accessible 3D tour file');
        } else {
          // For regular properties, check the assets table
          const { data: asset, error: assetError } = await supabase
            .from('assets')
            .select('*')
            .eq('property_id', propertyId)
            .eq('category', '3d_tour')
            .eq('type', 'glb')
            .eq('status', 'active')
            .single();

          if (assetError) {
            // For non-demo properties, a missing tour is not an error
            if (assetError.code === 'PGRST116') { // No rows returned
              setModelUrl(null);
              return;
            }
            throw assetError;
          }

          if (asset) {
            const { data: { publicUrl } } = supabase
              .storage
              .from('property-assets')
              .getPublicUrl(asset.storage_path);
            
            console.log('Loading 3D tour asset:', {
              asset,
              publicUrl,
              storage_path: asset.storage_path
            });
            
            setModelUrl(publicUrl);
            return;
          }
        }

        // If we get here and it's not a demo property, no tour is available
        setModelUrl(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch 3D tour'));
      } finally {
        setLoading(false);
      }
    }

    fetch3DTour();
  }, [propertyId, isDemo]);

  return { modelUrl, loading, error };
} 