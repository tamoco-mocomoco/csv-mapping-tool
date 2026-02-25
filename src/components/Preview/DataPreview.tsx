import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Tabs,
  Tab,
  Box,
  Switch,
  FormControlLabel,
  ToggleButtonGroup,
  ToggleButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
  Collapse,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useMappingContext } from '../../contexts/MappingContext';
import { transformData } from '../../utils/transform';
import { DataTable } from './DataTable';
import { CsvExporter } from '../FileIO/CsvExporter';
import type { DataFilter } from '../../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

export function applyDataFilter(
  sourceData: Record<string, string>[],
  transformedData: Record<string, string>[],
  dataFilter: DataFilter
): { filteredSource: Record<string, string>[]; filteredTransformed: Record<string, string>[] } {
  if (!dataFilter.enabled || !dataFilter.columnId || !dataFilter.pattern) {
    return { filteredSource: sourceData, filteredTransformed: transformedData };
  }

  let regex: RegExp;
  try {
    regex = new RegExp(dataFilter.pattern);
  } catch {
    return { filteredSource: sourceData, filteredTransformed: transformedData };
  }

  const dataToFilter = dataFilter.columnType === 'source' ? sourceData : transformedData;
  const matchedIndices: number[] = [];

  dataToFilter.forEach((row, index) => {
    const value = row[dataFilter.columnId] ?? '';
    if (regex.test(value)) {
      matchedIndices.push(index);
    }
  });

  return {
    filteredSource: matchedIndices.map((i) => sourceData[i]),
    filteredTransformed: matchedIndices.map((i) => transformedData[i]),
  };
}

export function DataPreview() {
  const [tabValue, setTabValue] = useState(0);
  const { sourceData, sourceColumns, targetColumns, mappings, dataFilter, setDataFilter } =
    useMappingContext();

  const transformedData = useMemo(() => {
    return transformData(sourceData, mappings, sourceColumns, targetColumns);
  }, [sourceData, mappings, sourceColumns, targetColumns]);

  const { filteredSource, filteredTransformed } = useMemo(() => {
    return applyDataFilter(sourceData, transformedData, dataFilter);
  }, [sourceData, transformedData, dataFilter]);

  const filterColumns = dataFilter.columnType === 'source' ? sourceColumns : targetColumns;

  const handleFilterChange = (updates: Partial<DataFilter>) => {
    setDataFilter({ ...dataFilter, ...updates });
  };

  const isFiltered = dataFilter.enabled && dataFilter.columnId && dataFilter.pattern;

  return (
    <Card>
      <CardHeader
        title="プレビュー"
        titleTypographyProps={{ variant: 'h6' }}
        action={<CsvExporter />}
      />
      <CardContent>
        {/* フィルター設定 */}
        <Box sx={{ mb: 2, p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterListIcon fontSize="small" color={dataFilter.enabled ? 'primary' : 'disabled'} />
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={dataFilter.enabled}
                  onChange={(e) => handleFilterChange({ enabled: e.target.checked })}
                />
              }
              label="データフィルター"
            />
            {isFiltered && (
              <Typography variant="body2" color="text.secondary">
                ({filteredSource.length} / {sourceData.length} 件)
              </Typography>
            )}
          </Box>
          <Collapse in={dataFilter.enabled}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1.5, flexWrap: 'wrap' }}>
              <ToggleButtonGroup
                size="small"
                exclusive
                value={dataFilter.columnType}
                onChange={(_, v) => {
                  if (v) handleFilterChange({ columnType: v, columnId: '' });
                }}
              >
                <ToggleButton value="source">変換前</ToggleButton>
                <ToggleButton value="target">変換後</ToggleButton>
              </ToggleButtonGroup>
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>カラム</InputLabel>
                <Select
                  label="カラム"
                  value={dataFilter.columnId}
                  onChange={(e) => handleFilterChange({ columnId: e.target.value })}
                >
                  {filterColumns.map((col) => (
                    <MenuItem key={col.id} value={col.id}>
                      {col.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                size="small"
                label="正規表現パターン"
                placeholder="例: C0000000[12]"
                value={dataFilter.pattern}
                onChange={(e) => handleFilterChange({ pattern: e.target.value })}
                sx={{ minWidth: 200 }}
              />
            </Box>
          </Collapse>
        </Box>

        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab label="変換前" />
          <Tab label="変換後" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <DataTable columns={sourceColumns} data={filteredSource} />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <DataTable columns={targetColumns} data={filteredTransformed} />
        </TabPanel>
      </CardContent>
    </Card>
  );
}
