import { Box, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import type { ConverterConfig, Column } from '../../types';

interface ConditionalConfigProps {
  config: ConverterConfig;
  onChange: (config: ConverterConfig) => void;
  sourceColumns: Column[];
}

export function ConditionalConfig({ config, onChange, sourceColumns }: ConditionalConfigProps) {
  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
      <FormControl size="small" sx={{ minWidth: 140 }}>
        <InputLabel>条件カラム</InputLabel>
        <Select
          value={config.conditionColumnId || ''}
          label="条件カラム"
          onChange={(e) => onChange({ ...config, conditionColumnId: e.target.value })}
          data-testid="condition-column-select"
        >
          {sourceColumns.map((col) => (
            <MenuItem key={col.id} value={col.id}>
              {col.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        size="small"
        label="正規表現パターン"
        value={config.conditionPattern || ''}
        onChange={(e) => onChange({ ...config, conditionPattern: e.target.value })}
        sx={{ width: 160 }}
        placeholder="例: C\d{8}"
      />
      <TextField
        size="small"
        label="マッチ時の値"
        value={config.conditionValue || ''}
        onChange={(e) => onChange({ ...config, conditionValue: e.target.value })}
        sx={{ width: 120 }}
      />
      <TextField
        size="small"
        label="非マッチ時の値"
        value={config.conditionElseValue || ''}
        onChange={(e) => onChange({ ...config, conditionElseValue: e.target.value })}
        sx={{ width: 120 }}
        placeholder="省略可"
      />
    </Box>
  );
}
