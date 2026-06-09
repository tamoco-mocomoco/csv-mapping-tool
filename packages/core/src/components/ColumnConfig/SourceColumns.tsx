import {
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  Typography,
  IconButton,
  Button,
  Box,
} from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useMappingContext } from '../../contexts/MappingContext';
import { CsvImporter } from '../FileIO/CsvImporter';

export function SourceColumns() {
  const { sourceColumns, targetColumns, addTargetColumn } = useMappingContext();

  const handleCopyColumn = (columnName: string) => {
    // 既に同名のカラムがあるかチェック
    const exists = targetColumns.some((col) => col.name === columnName);
    if (exists) {
      return; // 既にあれば追加しない
    }
    addTargetColumn(columnName);
  };

  const handleCopyAll = () => {
    sourceColumns.forEach((col) => {
      const exists = targetColumns.some((tc) => tc.name === col.name);
      if (!exists) {
        addTargetColumn(col.name);
      }
    });
  };

  const isColumnCopied = (columnName: string) => {
    return targetColumns.some((col) => col.name === columnName);
  };

  return (
    <Card>
      <CardHeader
        title="変換前カラム"
        titleTypographyProps={{ variant: 'h6' }}
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            {sourceColumns.length > 0 && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<ContentCopyIcon />}
                onClick={handleCopyAll}
              >
                全てコピー
              </Button>
            )}
            <CsvImporter mode="columns" />
          </Box>
        }
      />
      <CardContent>
        {sourceColumns.length === 0 ? (
          <Typography color="text.secondary" variant="body2">
            CSVからカラム定義をインポートしてください
          </Typography>
        ) : (
          <List dense>
            {sourceColumns.map((column) => {
              const copied = isColumnCopied(column.name);
              return (
                <ListItem
                  key={column.id}
                  secondaryAction={
                    <IconButton
                      size="small"
                      onClick={() => handleCopyColumn(column.name)}
                      disabled={copied}
                      color={copied ? 'default' : 'primary'}
                    >
                      <ChevronRightIcon />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={column.name}
                    sx={{ color: copied ? 'text.secondary' : 'text.primary' }}
                  />
                </ListItem>
              );
            })}
          </List>
        )}
      </CardContent>
    </Card>
  );
}
