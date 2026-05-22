import { useState, useCallback } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Button, TextField,
  Chip, Divider, CircularProgress, IconButton, Tooltip, Alert, Snackbar
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

const PACK_THEMES = [
  { id: 'fantasy', label: '🐉 Fantasy', color: '#9c27b0' },
  { id: 'scifi', label: '🚀 Sci-Fi', color: '#2196f3' },
  { id: 'horror', label: '🕷️ Horror', color: '#f44336' },
  { id: 'romance', label: '🌹 Romance', color: '#e91e63' },
  { id: 'nature', label: '🌿 Nature', color: '#4caf50' },
  { id: 'cyberpunk', label: '🤖 Cyberpunk', color: '#00bcd4' },
  { id: 'medieval', label: '⚔️ Medieval', color: '#ff9800' },
  { id: 'cosmic', label: '✨ Cosmic', color: '#673ab7' },
];

const SEED_LISTS = {
  fantasy: {
    characters: ['brave hero', 'ancient wizard', 'dark elf', 'paladin', 'shapeshifter', 'cursed knight', 'forest nymph', 'dragon rider'],
    settings: ['enchanted forest', 'floating castle', 'underground kingdom', 'cursed village', 'mystical tower', 'dragon mountain'],
    conflicts: ['forbidden spell', 'stolen relic', 'broken prophecy', 'demon invasion', 'royal betrayal', 'cursed bloodline'],
    moods: ['epic', 'mysterious', 'dark', 'whimsical', 'tragic', 'triumphant'],
  },
  scifi: {
    characters: ['rogue AI', 'space marine', 'alien diplomat', 'cyborg detective', 'time agent', 'clone soldier', 'galactic trader'],
    settings: ['derelict spaceship', 'alien megacity', 'terraformed Mars', 'quantum lab', 'space station', 'dyson sphere'],
    conflicts: ['alien invasion', 'AI uprising', 'resource war', 'time paradox', 'colony collapse', 'dark matter breach'],
    moods: ['tense', 'hopeful', 'bleak', 'adventurous', 'paranoid', 'wonder-filled'],
  },
  horror: {
    characters: ['haunted survivor', 'cursed detective', 'possessed child', 'ancient entity', 'mad scientist', 'cult leader'],
    settings: ['abandoned asylum', 'fog-covered town', 'cursed mansion', 'deep forest', 'underwater station', 'parallel dimension'],
    conflicts: ['ancient curse', 'demonic possession', 'psychological break', 'viral infection', 'reality collapse', 'forbidden ritual'],
    moods: ['terrifying', 'unsettling', 'claustrophobic', 'surreal', 'dreadful', 'cosmic horror'],
  },
  romance: {
    characters: ['brooding artist', 'charming scientist', 'mysterious stranger', 'childhood friend', 'rival turned lover', 'time traveler'],
    settings: ['rainy Paris café', 'island retreat', 'quaint bookshop', 'mountain cabin', 'starlit rooftop', 'hidden garden'],
    conflicts: ['forbidden love', 'second chance', 'long distance', 'rival suitor', 'secret identity', 'timed deadline'],
    moods: ['passionate', 'tender', 'bittersweet', 'playful', 'intense', 'heartfelt'],
  },
  nature: {
    characters: ['wandering naturalist', 'forest guardian', 'storm chaser', 'marine biologist', 'lone ranger', 'earth spirit'],
    settings: ['ancient rainforest', 'frozen tundra', 'volcanic island', 'deep ocean', 'vast savanna', 'hidden valley'],
    conflicts: ['ecosystem collapse', 'natural disaster', 'lost expedition', 'climate shift', 'territorial dispute', 'discovery'],
    moods: ['serene', 'awe-inspiring', 'survival', 'meditative', 'raw', 'transformative'],
  },
  cyberpunk: {
    characters: ['street hacker', 'corpo spy', 'augmented merc', 'rogue netrunner', 'underground journalist', 'AI ghost'],
    settings: ['neon megacity', 'server underbelly', 'corporate arcology', 'black market bazaar', 'virtual construct', 'rooftop slums'],
    conflicts: ['data heist', 'corporate war', 'identity theft', 'AI rebellion', 'memory implant gone wrong', 'off-grid survival'],
    moods: ['gritty', 'neon-soaked', 'paranoid', 'electric', 'bleak-hope', 'razor-sharp'],
  },
  medieval: {
    characters: ['disgraced knight', 'peasant hero', 'corrupt bishop', 'travelling bard', 'royal assassin', 'hedge witch'],
    settings: ['walled city', 'cathedral crypt', 'siege battlefield', 'plague village', 'king\'s court', 'monastic ruins'],
    conflicts: ['succession war', 'plague outbreak', 'crusade', 'peasant revolt', 'witch hunt', 'tournament betrayal'],
    moods: ['brutal', 'chivalric', 'grim', 'folkloric', 'political', 'reverent'],
  },
  cosmic: {
    characters: ['void wanderer', 'cosmic deity', 'star pilgrim', 'entropy agent', 'multiverse architect', 'singularity being'],
    settings: ['event horizon', 'nebula temple', 'collapsed star', 'space-time rift', 'quantum realm', 'universe membrane'],
    conflicts: ['heat death', 'dimensional merge', 'cosmic awakening', 'entropy vs order', 'big crunch paradox', 'void infection'],
    moods: ['transcendent', 'incomprehensible', 'beautiful', 'terrifying', 'meditative', 'infinite'],
  },
};

const pick = arr => arr[Math.floor(Math.random() * arr.length)];

function buildPerchanceOutput(theme, entries) {
  const lines = ['output'];
  entries.forEach(e => {
    if (e.trim()) lines.push('  ' + e.trim());
  });
  return lines.join('\n');
}

export default function PackBuilder() {
  const [selectedTheme, setSelectedTheme] = useState('fantasy');
  const [entries, setEntries] = useState([]);
  const [customEntry, setCustomEntry] = useState('');
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState('');
  const [snack, setSnack] = useState({ open: false, msg: '' });
  const [packName, setPackName] = useState('My Pack');
  const [packSize, setPackSize] = useState(10);

  const seeds = SEED_LISTS[selectedTheme] || SEED_LISTS.fantasy;

  const generatePack = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      const generated = [];
      for (let i = 0; i < packSize; i++) {
        const char = pick(seeds.characters);
        const setting = pick(seeds.settings);
        const conflict = pick(seeds.conflicts);
        const mood = pick(seeds.moods);
        generated.push(`${mood} ${char} in a ${setting} facing ${conflict}`);
      }
      setEntries(prev => {
        const all = [...prev, ...generated];
        const unique = [...new Set(all)].slice(0, 60);
        const built = buildPerchanceOutput(selectedTheme, unique);
        setOutput(built);
        return unique;
      });
      setLoading(false);
    }, 320);
  }, [selectedTheme, packSize, seeds]);

  const addCustom = () => {
    if (!customEntry.trim()) return;
    const next = [...entries, customEntry.trim()].slice(0, 60);
    setEntries(next);
    setOutput(buildPerchanceOutput(selectedTheme, next));
    setCustomEntry('');
  };

  const removeEntry = idx => {
    const next = entries.filter((_, i) => i !== idx);
    setEntries(next);
    setOutput(buildPerchanceOutput(selectedTheme, next));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output).then(() => setSnack({ open: true, msg: 'Copied to clipboard!' }));
  };

  const handleDownload = () => {
    const blob = new Blob([output], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${packName.replace(/\s+/g, '-').toLowerCase()}.txt`;
    a.click();
    setSnack({ open: true, msg: 'Downloaded!' });
  };

  const handleShuffle = () => {
    const shuffled = [...entries].sort(() => Math.random() - 0.5);
    setEntries(shuffled);
    setOutput(buildPerchanceOutput(selectedTheme, shuffled));
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={800} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoAwesomeIcon sx={{ color: 'primary.main' }} /> Pack Builder
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Generează un pack Perchance randomizat gata de folosit — alege tema, size, adaugă intrări custom și exportă.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Left panel — Config */}
        <Grid item xs={12} md={5}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>1. Configurare pack</Typography>
              <TextField label="Nume pack" value={packName} onChange={e => setPackName(e.target.value)}
                size="small" fullWidth sx={{ mb: 2 }} />
              <TextField label="Număr intrări generate" type="number" value={packSize}
                onChange={e => setPackSize(Math.min(50, Math.max(1, +e.target.value)))}
                size="small" fullWidth inputProps={{ min: 1, max: 50 }} sx={{ mb: 2 }} />

              <Typography variant="subtitle2" gutterBottom>2. Temă</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {PACK_THEMES.map(t => (
                  <Chip key={t.id} label={t.label} clickable
                    onClick={() => setSelectedTheme(t.id)}
                    variant={selectedTheme === t.id ? 'filled' : 'outlined'}
                    sx={selectedTheme === t.id ? { background: t.color, color: '#fff', fontWeight: 700 } : { borderColor: t.color + '88', color: t.color }} />
                ))}
              </Box>

              <Button variant="contained" fullWidth startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <AutoAwesomeIcon />}
                onClick={generatePack} disabled={loading} sx={{ mb: 1 }}>
                {loading ? 'Generez...' : 'Generează pack'}
              </Button>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" gutterBottom>3. Adaugă intrare custom</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField size="small" placeholder="ex: lonely samurai in a burning dojo..."
                  value={customEntry} onChange={e => setCustomEntry(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addCustom()}
                  fullWidth />
                <IconButton onClick={addCustom} color="primary"><AddIcon /></IconButton>
              </Box>
            </CardContent>
          </Card>

          {/* Entries list */}
          {entries.length > 0 && (
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2" fontWeight={700}>Intrări ({entries.length}/60)</Typography>
                  <Tooltip title="Amestecă">
                    <IconButton size="small" onClick={handleShuffle}><ShuffleIcon fontSize="small" /></IconButton>
                  </Tooltip>
                </Box>
                <Box sx={{ maxHeight: 320, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {entries.map((e, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5, px: 1,
                      borderRadius: 1, background: 'rgba(255,255,255,0.03)', '&:hover': { background: 'rgba(255,255,255,0.06)' } }}>
                      <Typography variant="caption" sx={{ flex: 1, color: 'text.secondary', fontFamily: 'monospace' }}>{e}</Typography>
                      <IconButton size="small" onClick={() => removeEntry(i)} sx={{ opacity: 0.4, '&:hover': { opacity: 1, color: 'error.main' } }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Right panel — Output */}
        <Grid item xs={12} md={7}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" fontWeight={700}>Output Perchance</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Copy">
                    <span><IconButton size="small" onClick={handleCopy} disabled={!output}><ContentCopyIcon fontSize="small" /></IconButton></span>
                  </Tooltip>
                  <Tooltip title="Download .txt">
                    <span><IconButton size="small" onClick={handleDownload} disabled={!output}><DownloadIcon fontSize="small" /></IconButton></span>
                  </Tooltip>
                </Box>
              </Box>

              {!output ? (
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2, opacity: 0.4 }}>
                  <AutoAwesomeIcon sx={{ fontSize: 48 }} />
                  <Typography variant="body2">Alege o temă și apasă "Generează pack"</Typography>
                </Box>
              ) : (
                <TextField multiline value={output} onChange={e => setOutput(e.target.value)}
                  variant="outlined" fullWidth
                  sx={{ flex: 1, '& .MuiInputBase-root': { height: '100%', alignItems: 'flex-start', fontFamily: 'monospace', fontSize: 12 },
                    '& textarea': { height: '100% !important' } }}
                  inputProps={{ style: { fontFamily: 'monospace', fontSize: 12, lineHeight: 1.7 } }} />
              )}

              {output && (
                <Alert severity="info" sx={{ mt: 2, fontSize: 12 }}>
                  Copiază outputul în <strong>perchance.org/create</strong> și plasează-l într-un list section.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar open={snack.open} autoHideDuration={2500} onClose={() => setSnack({ open: false, msg: '' })}
        message={snack.msg} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
    </Box>
  );
}
