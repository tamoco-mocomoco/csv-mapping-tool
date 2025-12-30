import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  IconButton,
  TextField,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
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
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useMappingContext } from '../../contexts/MappingContext';
import type { Column } from '../../types';

interface SortableItemProps {
  column: Column;
  onEdit: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

function SortableItem({ column, onEdit, onDelete }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <ListItem
      ref={setNodeRef}
      style={style}
      sx={{
        bgcolor: isDragging ? 'action.hover' : 'transparent',
        borderRadius: 1,
      }}
      secondaryAction={
        <Box>
          <IconButton
            size="small"
            onClick={() => onEdit(column.id, column.name)}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => onDelete(column.id)}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      }
    >
      <IconButton
        size="small"
        sx={{ cursor: 'grab', mr: 1 }}
        {...attributes}
        {...listeners}
      >
        <DragIndicatorIcon fontSize="small" color="action" />
      </IconButton>
      <ListItemText primary={column.name} />
    </ListItem>
  );
}

export function TargetColumns() {
  const { targetColumns, addTargetColumn, updateTargetColumn, removeTargetColumn, reorderTargetColumns } =
    useMappingContext();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [columnName, setColumnName] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleOpenAdd = () => {
    setEditingId(null);
    setColumnName('');
    setDialogOpen(true);
  };

  const handleOpenEdit = (id: string, name: string) => {
    setEditingId(id);
    setColumnName(name);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditingId(null);
    setColumnName('');
  };

  const handleSave = () => {
    if (!columnName.trim()) return;

    if (editingId) {
      updateTargetColumn(editingId, columnName.trim());
    } else {
      addTargetColumn(columnName.trim());
    }
    handleClose();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('このカラムを削除しますか？')) {
      removeTargetColumn(id);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = targetColumns.findIndex((col) => col.id === active.id);
      const newIndex = targetColumns.findIndex((col) => col.id === over.id);
      reorderTargetColumns(oldIndex, newIndex);
    }
  };

  return (
    <>
      <Card>
        <CardHeader
          title="変換後カラム"
          titleTypographyProps={{ variant: 'h6' }}
          action={
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={handleOpenAdd}
            >
              カラム追加
            </Button>
          }
        />
        <CardContent>
          {targetColumns.length === 0 ? (
            <Typography color="text.secondary" variant="body2">
              カラムを追加してください
            </Typography>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={targetColumns.map((col) => col.id)}
                strategy={verticalListSortingStrategy}
              >
                <List dense>
                  {targetColumns.map((column) => (
                    <SortableItem
                      key={column.id}
                      column={column}
                      onEdit={handleOpenEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </List>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={handleClose}>
        <DialogTitle>
          {editingId ? 'カラム編集' : 'カラム追加'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="カラム名"
            fullWidth
            variant="outlined"
            value={columnName}
            onChange={(e) => setColumnName(e.target.value)}
            onKeyDown={(e) => {
              // IME変換中のEnterは無視
              if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                handleSave();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>キャンセル</Button>
          <Button onClick={handleSave} variant="contained">
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
