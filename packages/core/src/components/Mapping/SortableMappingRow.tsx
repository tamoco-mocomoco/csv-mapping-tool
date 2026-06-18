import { Box, IconButton } from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MappingRow } from './MappingRow';
import type { Mapping, Column, ConverterConfig } from '../../types';

interface SortableMappingRowProps {
  mapping: Mapping;
  sourceColumns: Column[];
  targetColumns: Column[];
  onUpdate: (updates: Partial<Mapping>) => void;
  onAddConverter: () => void;
  onUpdateConverter: (index: number, config: ConverterConfig) => void;
  onRemoveConverter: (index: number) => void;
  onRemove: () => void;
}

export function SortableMappingRow({
  mapping,
  sourceColumns,
  targetColumns,
  onUpdate,
  onAddConverter,
  onUpdateConverter,
  onRemoveConverter,
  onRemove,
}: SortableMappingRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: mapping.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      sx={{
        position: 'relative',
        bgcolor: isDragging ? 'action.hover' : 'transparent',
        borderRadius: 1,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          left: -8,
          top: 16,
          zIndex: 1,
        }}
      >
        <IconButton
          size="small"
          sx={{ cursor: 'grab' }}
          {...attributes}
          {...listeners}
        >
          <DragIndicatorIcon fontSize="small" color="action" />
        </IconButton>
      </Box>
      <Box sx={{ pl: 4 }}>
        <MappingRow
          mapping={mapping}
          sourceColumns={sourceColumns}
          targetColumns={targetColumns}
          onUpdate={onUpdate}
          onAddConverter={onAddConverter}
          onUpdateConverter={onUpdateConverter}
          onRemoveConverter={onRemoveConverter}
          onRemove={onRemove}
        />
      </Box>
    </Box>
  );
}
