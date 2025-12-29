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
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AddIcon from '@mui/icons-material/Add';
import type { Mapping, Column, ConverterConfig } from '../../types';
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
  // 有効なIDかチェックし、無効なら空文字にフォールバック
  const validSourceId = sourceColumns.some((col) => col.id === mapping.sourceColumnId)
    ? mapping.sourceColumnId
    : '';
  const validTargetId = targetColumns.some((col) => col.id === mapping.targetColumnId)
    ? mapping.targetColumnId
    : '';

  // 後方互換性: converterがある場合はconvertersに変換
  const converters = mapping.converters || [{ type: 'direct' as const }];

  return (
    <Paper sx={{ p: 2, mb: 2 }} variant="outlined">
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          mb: 2,
        }}
      >
        {/* 変換元カラム */}
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>変換元</InputLabel>
          <Select
            value={validSourceId}
            label="変換元"
            onChange={(e) => onUpdate({ sourceColumnId: e.target.value })}
          >
            {sourceColumns.map((col) => (
              <MenuItem key={col.id} value={col.id}>
                {col.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

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
          <IconButton size="small" onClick={onAddConverter} color="primary">
            <AddIcon fontSize="small" />
          </IconButton>
        </Box>

        {converters.map((converter, index) => (
          <Box
            key={index}
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
