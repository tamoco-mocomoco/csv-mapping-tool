import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Paper,
  Typography,
  Chip,
  Checkbox,
  ListItemText,
  TextField,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AddIcon from '@mui/icons-material/Add';
import type { Mapping, Column, ConverterConfig } from '../../types';
import { getSourceColumnIds } from '../../types';
import { ConverterSelect } from '../Converters/ConverterSelect';

interface MappingRowProps {
  mapping: Mapping;
  sourceColumns: Column[];
  targetColumns: Column[];
  onUpdate: (updates: Partial<Mapping>) => void;
  onAddConverter: () => void;
  onUpdateConverter: (index: number, config: ConverterConfig) => void;
  onRemoveConverter: (index: number) => void;
  onRemove: () => void;
}

export function MappingRow({
  mapping,
  sourceColumns,
  targetColumns,
  onUpdate,
  onAddConverter,
  onUpdateConverter,
  onRemoveConverter,
  onRemove,
}: MappingRowProps) {
  // sourceColumnIds を取得（後方互換性対応）
  const sourceIds = getSourceColumnIds(mapping);
  // 有効なIDのみをフィルタリング
  const validSourceIds = sourceIds.filter((id) =>
    sourceColumns.some((col) => col.id === id)
  );
  const validTargetId = targetColumns.some((col) => col.id === mapping.targetColumnId)
    ? mapping.targetColumnId
    : '';

  // 後方互換性: converterがある場合はconvertersに変換
  const converters = mapping.converters || [{ type: 'direct' as const }];

  return (
    <Paper sx={{ p: 2, mb: 2 }} variant="outlined" data-testid="mapping-row">
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          mb: 2,
        }}
      >
        {/* 変換元カラム（複数選択可能） */}
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>変換元</InputLabel>
          <Select
            multiple
            value={validSourceIds}
            label="変換元"
            onChange={(e) => {
              const value = e.target.value as string[];
              onUpdate({
                sourceColumnIds: value,
                sourceColumnId: undefined, // 旧形式をクリア
              });
            }}
            data-testid="source-column-select"
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {(selected as string[]).map((id) => {
                  const col = sourceColumns.find((c) => c.id === id);
                  return (
                    <Chip
                      key={id}
                      label={col?.name || id}
                      size="small"
                      sx={{ height: 20 }}
                    />
                  );
                })}
              </Box>
            )}
          >
            {sourceColumns.map((col) => (
              <MenuItem key={col.id} value={col.id}>
                <Checkbox checked={validSourceIds.includes(col.id)} size="small" />
                <ListItemText primary={col.name} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* 複数選択時のみ区切り文字入力を表示 */}
        {validSourceIds.length > 1 && (
          <TextField
            size="small"
            label="区切り文字"
            value={mapping.separator ?? ''}
            onChange={(e) => onUpdate({ separator: e.target.value })}
            sx={{ width: 100 }}
            placeholder="例: スペース"
            data-testid="separator-input"
          />
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', pt: 1 }}>
          <ArrowForwardIcon color="action" />
        </Box>

        {/* 変換先カラム */}
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>変換先</InputLabel>
          <Select
            value={validTargetId}
            label="変換先"
            onChange={(e) => onUpdate({ targetColumnId: e.target.value })}
            data-testid="target-column-select"
          >
            {targetColumns.map((col) => (
              <MenuItem key={col.id} value={col.id}>
                {col.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ flexGrow: 1 }} />

        {/* 削除ボタン */}
        <IconButton onClick={onRemove} color="error" size="small">
          <DeleteIcon />
        </IconButton>
      </Box>

      {/* コンバーターリスト */}
      <Box sx={{ pl: 2, borderLeft: '2px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            コンバーター
          </Typography>
          <IconButton size="small" onClick={onAddConverter} color="primary" data-testid="add-converter-button">
            <AddIcon fontSize="small" />
          </IconButton>
        </Box>

        {converters.map((converter, index) => (
          <Box
            key={index}
            data-testid={`converter-row-${index}`}
            sx={{
              display: 'flex',
              gap: 1,
              alignItems: 'center',
              mb: 1,
              p: 1,
              bgcolor: 'grey.50',
              borderRadius: 1,
            }}
          >
            <Chip
              label={`${index + 1}`}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ minWidth: 32 }}
            />
            <ConverterSelect
              config={converter}
              onChange={(config) => onUpdateConverter(index, config)}
            />
            {converters.length > 1 && (
              <IconButton
                size="small"
                onClick={() => onRemoveConverter(index)}
                color="error"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        ))}
      </Box>
    </Paper>
  );
}
