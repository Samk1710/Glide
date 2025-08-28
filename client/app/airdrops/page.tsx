'use client';
import { useEffect, useState } from 'react';

type AirdropFull = any;
type ApiResp<T> = { ok: boolean; data?: T; error?: string; count?: number };

export default function AirdropsPage() {
  const [items, setItems] = useState<AirdropFull[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const r = await fetch('/api/airdrops', { cache: 'no-store' });
        const j = (await r.json()) as ApiResp<AirdropFull[]>;
        if (j.ok && j.data) {
          setItems(j.data);
          setCount(j.count || j.data.length);
        } else {
          console.error('API error:', j.error);
        }
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <main style={{ maxWidth: 980, margin: '0 auto', padding: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Loading Airdrops...</h1>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 980, margin: '0 auto', padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>All Airdrops (First 10 - {count} total)</h1>
      <p style={{ opacity: 0.8 }}>Click a card to toggle raw JSON view.</p>
      {items.length === 0 ? (
        <p style={{ marginTop: 16, padding: 20, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
          No airdrops found. The system should automatically generate fake data on first load.
        </p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12, marginTop: 16 }}>
          {items.map((x: any) => (
            <div key={x.slug} style={{ border: '1px solid #eee', borderRadius: 12, padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => setExpanded(expanded === x.slug ? null : x.slug)}>
                <div>
                  <strong>{x.name}</strong> <span style={{ opacity: 0.7 }}>({x.category})</span>
                </div>
                <span style={{ fontSize: 12, border: '1px solid #ddd', padding: '2px 8px', borderRadius: 12 }}>{x.sources?.evidence_level}</span>
              </div>
              {expanded === x.slug && (
                <pre style={{ marginTop: 10, whiteSpace: 'pre-wrap', fontSize: 12 }}>{JSON.stringify(x, null, 2)}</pre>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
