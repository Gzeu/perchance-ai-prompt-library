// web/src/components/PromptCard.tsx — v4.0.0
import React, { useState, useCallback } from 'react';

interface PromptCardProps {
  prompt: string;
  category: string;
  style: string;
  quality: number;
  tags?: string[];
  onFavorite?: (prompt: string) => void;
  onCopy?: (prompt: string) => void;
  onRegenerate?: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  anime: '#7c3aed',
  realistic: '#059669',
  fantasy: '#d97706',
  scifi: '#2563eb',
};

export const PromptCard: React.FC<PromptCardProps> = ({
  prompt,
  category,
  style,
  quality,
  tags = [],
  onFavorite,
  onCopy,
  onRegenerate,
}) => {
  const [copied, setCopied] = useState(false);
  const [favorited, setFavorited] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    onCopy?.(prompt);
    setTimeout(() => setCopied(false), 2000);
  }, [prompt, onCopy]);

  const handleFavorite = useCallback(() => {
    setFavorited((prev) => !prev);
    onFavorite?.(prompt);
  }, [prompt, onFavorite]);

  const accentColor = CATEGORY_COLORS[category] ?? '#6b7280';
  const qualityColor = quality >= 90 ? '#059669' : quality >= 75 ? '#d97706' : '#dc2626';

  return (
    <div
      style={{
        background: '#1e1e2e',
        border: `1px solid ${accentColor}40`,
        borderRadius: '12px',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        fontFamily: 'Inter, sans-serif',
        color: '#cdd6f4',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: accentColor }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span
          style={{
            background: `${accentColor}20`,
            color: accentColor,
            padding: '2px 10px',
            borderRadius: '999px',
            fontSize: '0.75rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {category}
        </span>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: qualityColor, fontWeight: 700 }}>⭐ {quality}/100</span>
          <button
            onClick={handleFavorite}
            title={favorited ? 'Elimină din favorite' : 'Adaugă la favorite'}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}
          >
            {favorited ? '❤️' : '🤍'}
          </button>
        </div>
      </div>

      <p
        style={{
          fontFamily: 'Geist Mono, monospace',
          fontSize: '0.85rem',
          lineHeight: 1.6,
          color: '#a6e3a1',
          background: '#181825',
          padding: '0.75rem',
          borderRadius: '8px',
          margin: 0,
          wordBreak: 'break-word',
        }}
      >
        {prompt}
      </p>

      {tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
          {tags.map((tag) => (
            <span
              key={tag}
              style={{
                background: '#313244',
                color: '#89b4fa',
                fontSize: '0.7rem',
                padding: '2px 8px',
                borderRadius: '999px',
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div style={{ fontSize: '0.75rem', color: '#6c7086' }}>
        🎨 Stil: <strong style={{ color: '#cba6f7' }}>{style}</strong>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
        <button
          onClick={handleCopy}
          style={{
            flex: 1,
            background: copied ? '#059669' : '#313244',
            color: copied ? '#fff' : '#cdd6f4',
            border: 'none',
            borderRadius: '8px',
            padding: '0.5rem',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: 600,
            transition: 'background 0.2s',
          }}
        >
          {copied ? '✅ Copiat!' : '📋 Copiază'}
        </button>
        {onRegenerate && (
          <button
            onClick={onRegenerate}
            style={{
              flex: 1,
              background: '#313244',
              color: '#cdd6f4',
              border: 'none',
              borderRadius: '8px',
              padding: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            🔄 Regenerează
          </button>
        )}
      </div>
    </div>
  );
};

export default PromptCard;
