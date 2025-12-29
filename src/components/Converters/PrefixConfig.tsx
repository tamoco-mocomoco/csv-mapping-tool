import { Box, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import type { ConverterConfig, PrefixType } from '../../types';

interface PrefixConfigProps {
  config: ConverterConfig;
  onChange: (config: ConverterConfig) => void;
}

export function PrefixConfig({ config, onChange }: PrefixConfigProps) {
  const prefixType = config.prefixType || 'fixed';

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>タイプ</InputLabel>
        <Select
          value={prefixType}
          label="タイプ"
          onChange={(e) =>
            onChange({ ...config, prefixType: e.target.value as PrefixType })
          }
        >
          <MenuItem value="fixed">固定文字列</MenuItem>
          <MenuItem value="random">ランダム</MenuItem>
          <MenuItem value="date">日付</MenuItem>
        </Select>
      </FormControl>

      {prefixType === 'fixed' && (
        <TextField
          size="small"
          label="接頭辞"
          value={config.fixedPrefix || ''}
          onChange={(e) => onChange({ ...config, fixedPrefix: e.target.value })}
          sx={{ width: 120 }}
        />
      )}

      {prefixType === 'random' && (
        <TextField
          size="small"
          label="文字数"
          type="number"
          value={config.randomLength || 8}
          onChange={(e) =>
            onChange({ ...config, randomLength: parseInt(e.target.value) || 8 })
          }
          sx={{ width: 80 }}
          inputProps={{ min: 1, max: 32 }}
        />
      )}

      {prefixType === 'date' && (
        <TextField
          size="small"
          label="フォーマット"
          value={config.dateFormat || 'YYYYMMDD'}
          onChange={(e) => onChange({ ...config, dateFormat: e.target.value })}
          sx={{ width: 150 }}
          placeholder="YYYYMMDD"
          helperText="YYYY,MM,DD,HH,mm,ss"
        />
      )}
    </Box>
  );
}
