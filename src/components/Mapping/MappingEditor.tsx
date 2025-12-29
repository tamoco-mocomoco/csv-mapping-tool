import { Card, CardContent, CardHeader, Button, Box, Typography, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useMappingContext } from '../../contexts/MappingContext';
import { SortableMappingRow } from './SortableMappingRow';

export function MappingEditor() {
  const {
    mappings,
    sourceColumns,
    targetColumns,
    addMapping,
    updateMapping,
    removeMapping,
    reorderMappings,
    autoMapMatchingColumns,
    addConverter,
    updateConverter,
    removeConverter,
  } = useMappingContext();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const canAddMapping = sourceColumns.length > 0 && targetColumns.length > 0;

  // 同名カラムでまだマッピングされていないものがあるかチェック
  const usedTargetIds = new Set(mappings.map((m) => m.targetColumnId));
  const hasUnmappedMatchingColumns = targetColumns.some(
    (targetCol) =>
      !usedTargetIds.has(targetCol.id) &&
      sourceColumns.some((sourceCol) => sourceCol.name === targetCol.name)
  );

  const handleAutoMap = () => {
    const count = autoMapMatchingColumns();
    if (count === 0) {
      alert('マッピング可能な同名カラムがありません');
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = mappings.findIndex((m) => m.id === active.id);
      const newIndex = mappings.findIndex((m) => m.id === over.id);
      reorderMappings(oldIndex, newIndex);
    }
  };

  return (
    <Card>
      <CardHeader
        title="マッピング設定"
        titleTypographyProps={{ variant: 'h6' }}
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="変換前と変換後で同じ名前のカラムを自動でマッピング">
              <span>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AutoFixHighIcon />}
                  onClick={handleAutoMap}
                  disabled={!canAddMapping || !hasUnmappedMatchingColumns}
                >
                  同名カラム一括設定
                </Button>
              </span>
            </Tooltip>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={addMapping}
              disabled={!canAddMapping}
            >
              マッピング追加
            </Button>
          </Box>
        }
      />
      <CardContent>
        {!canAddMapping ? (
          <Typography color="text.secondary" variant="body2">
            変換前・変換後カラムを設定してからマッピングを追加してください
          </Typography>
        ) : mappings.length === 0 ? (
          <Typography color="text.secondary" variant="body2">
            マッピングを追加してください
          </Typography>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={mappings.map((m) => m.id)}
              strategy={verticalListSortingStrategy}
            >
              <Box>
                {mappings.map((mapping) => (
                  <SortableMappingRow
                    key={mapping.id}
                    mapping={mapping}
                    sourceColumns={sourceColumns}
                    targetColumns={targetColumns}
                    onUpdate={(updates) => updateMapping(mapping.id, updates)}
                    onAddConverter={() => addConverter(mapping.id)}
                    onUpdateConverter={(index, config) =>
                      updateConverter(mapping.id, index, config)
                    }
                    onRemoveConverter={(index) => removeConverter(mapping.id, index)}
                    onRemove={() => removeMapping(mapping.id)}
                  />
                ))}
              </Box>
            </SortableContext>
          </DndContext>
        )}
      </CardContent>
    </Card>
  );
}
