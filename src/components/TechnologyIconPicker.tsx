import { useEffect, useState } from 'react';
import { POPULAR_ICON_PRESETS, findTechnologyIcons, savedTechnologyIconUrl } from '../lib/technology-icons';

interface TechnologyIconPickerProps {
  value: string;
  technologyName: string;
  onChange: (value: string) => void;
}

export function TechnologyIconPicker({ value, technologyName, onChange }: TechnologyIconPickerProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(technologyName || '');
  const [searchResults, setSearchResults] = useState<{ id: string; url: string }[]>([]);
  const [searching, setSearching] = useState(false);

  // Update preview when value or technologyName changes
  useEffect(() => {
    setLoadError(false);
    if (!value && !technologyName) {
      setPreviewUrl(null);
      return;
    }

    const resolved = savedTechnologyIconUrl(value);
    if (resolved) {
      setPreviewUrl(resolved);
      return;
    }

    if (technologyName) {
      setLoading(true);
      void findTechnologyIcons(technologyName, value).then((candidates) => {
        setPreviewUrl(candidates[0] || null);
        setLoading(false);
      });
    }
  }, [value, technologyName]);

  async function handleAutoDetect() {
    if (!technologyName) return;
    setLoading(true);
    const candidates = await findTechnologyIcons(technologyName);
    if (candidates[0]) {
      // If candidate is an iconify URL, extract the identifier
      const match = candidates[0].match(/api\.iconify\.design\/([^/]+)\/([^.]+)\.svg/);
      if (match) {
        onChange(`${match[1]}:${match[2]}`);
      } else {
        onChange(candidates[0]);
      }
    }
    setLoading(false);
  }

  async function performSearch(query: string) {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const response = await fetch(`https://api.iconify.design/search?query=${encodeURIComponent(query.trim())}&limit=24`);
      if (response.ok) {
        const data = await response.json() as { icons?: string[] };
        const icons = (data.icons || []).slice(0, 30).map((iconId) => {
          const [prefix, name] = iconId.split(':', 2);
          return {
            id: iconId,
            url: `https://api.iconify.design/${prefix}/${name}.svg`,
          };
        });
        setSearchResults(icons);
      }
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="tech-icon-picker-field af">
      <span>Technology Icon</span>

      <div className="tech-icon-picker-row">
        {/* Live Preview Box */}
        <div className="tech-icon-preview-box" title={value || 'No icon selected'}>
          {loading ? (
            <span className="icon-spinner" aria-hidden="true">…</span>
          ) : previewUrl && !loadError ? (
            <img
              src={previewUrl}
              alt=""
              onError={() => setLoadError(true)}
              className="tech-icon-preview-img"
            />
          ) : (
            <span className="tech-icon-preview-placeholder">∅</span>
          )}
        </div>

        {/* Value Input */}
        <input
          type="text"
          value={value}
          placeholder="e.g. devicon:react, logos:nestjs, or image URL"
          onChange={(e) => onChange(e.target.value)}
          className="tech-icon-input"
        />

        {/* Action Buttons */}
        <button
          type="button"
          className="primary-action btn-sm"
          onClick={() => {
            setModalOpen(true);
            setSearchQuery(technologyName || '');
            if (technologyName) void performSearch(technologyName);
          }}
          title="Browse and search icon libraries"
        >
          🔍 Browse
        </button>

        <button
          type="button"
          className="text-action btn-sm"
          onClick={() => void handleAutoDetect()}
          title="Auto-detect icon based on technology name"
        >
          ✨ Auto
        </button>
      </div>

      {/* Helper hint */}
      <span className="tech-icon-hint">
        Format: <code>collection:name</code> (e.g. <code>devicon:typescript</code>, <code>logos:nextjs</code>, <code>simple-icons:mongodb</code>) or custom image URL.
      </span>

      {/* Modal for browsing and searching icons */}
      {modalOpen && (
        <div className="icon-picker-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="icon-picker-modal" onClick={(e) => e.stopPropagation()}>
            <div className="icon-picker-modal-header">
              <h3>Choose Icon for "{technologyName || 'Technology'}"</h3>
              <button
                type="button"
                className="text-action modal-close-btn"
                onClick={() => setModalOpen(false)}
              >
                ✕
              </button>
            </div>

            {/* Search Input */}
            <div className="icon-picker-search-bar">
              <input
                type="text"
                value={searchQuery}
                placeholder="Search icons (e.g. react, nest, postgres, python)…"
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    void performSearch(searchQuery);
                  }
                }}
              />
              <button
                type="button"
                className="primary-action btn-sm"
                onClick={() => void performSearch(searchQuery)}
              >
                Search
              </button>
            </div>

            {/* Search Results */}
            {searching ? (
              <div className="icon-picker-loading">Searching Iconify library…</div>
            ) : searchResults.length > 0 ? (
              <div className="icon-picker-section">
                <h4>Search Results ({searchResults.length})</h4>
                <div className="icon-picker-grid">
                  {searchResults.map((icon) => (
                    <button
                      type="button"
                      key={icon.id}
                      className={`icon-grid-item ${value === icon.id ? 'active' : ''}`}
                      onClick={() => {
                        onChange(icon.id);
                        setModalOpen(false);
                      }}
                      title={icon.id}
                    >
                      <img src={icon.url} alt={icon.id} loading="lazy" />
                      <span>{icon.id.split(':')[1]}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Popular Stacks Presets */}
            <div className="icon-picker-section">
              <h4>Popular Stacks & Tools</h4>
              <div className="icon-picker-grid">
                {POPULAR_ICON_PRESETS.map((preset) => {
                  const url = savedTechnologyIconUrl(preset.icon);
                  return (
                    <button
                      type="button"
                      key={preset.icon}
                      className={`icon-grid-item ${value === preset.icon ? 'active' : ''}`}
                      onClick={() => {
                        onChange(preset.icon);
                        setModalOpen(false);
                      }}
                      title={`${preset.label} (${preset.icon})`}
                    >
                      {url && <img src={url} alt={preset.label} loading="lazy" />}
                      <span>{preset.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
