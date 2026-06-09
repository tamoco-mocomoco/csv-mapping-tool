import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from '@mui/material';
import type { Column } from '../../types';

interface DataTableProps {
  columns: Column[];
  data: Record<string, string>[];
  maxRows?: number;
}

export function DataTable({ columns, data, maxRows = 10 }: DataTableProps) {
  if (columns.length === 0) {
    return (
      <Typography color="text.secondary" variant="body2">
        データがありません
      </Typography>
    );
  }

  const displayData = data.slice(0, maxRows);
  const hasMore = data.length > maxRows;

  return (
    <>
      <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col.id} sx={{ fontWeight: 'bold', bgcolor: 'grey.100' }}>
                  {col.name}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {displayData.map((row, rowIndex) => (
              <TableRow key={rowIndex} hover>
                {columns.map((col) => (
                  <TableCell key={col.id}>
                    {row[col.id] || ''}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {hasMore && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          ※ 表示は最初の{maxRows}件です（全{data.length}件）
        </Typography>
      )}
    </>
  );
}
