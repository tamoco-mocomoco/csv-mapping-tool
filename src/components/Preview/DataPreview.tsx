import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, Tabs, Tab, Box } from '@mui/material';
import { useMappingContext } from '../../contexts/MappingContext';
import { transformData } from '../../utils/transform';
import { DataTable } from './DataTable';
import { CsvExporter } from '../FileIO/CsvExporter';

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

export function DataPreview() {
  const [tabValue, setTabValue] = useState(0);
  const { sourceData, sourceColumns, targetColumns, mappings } = useMappingContext();

  const transformedData = useMemo(() => {
    return transformData(sourceData, mappings, sourceColumns, targetColumns);
  }, [sourceData, mappings, sourceColumns, targetColumns]);

  return (
    <Card>
      <CardHeader
        title="プレビュー"
        titleTypographyProps={{ variant: 'h6' }}
        action={<CsvExporter />}
      />
      <CardContent>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab label="変換前" />
          <Tab label="変換後" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <DataTable columns={sourceColumns} data={sourceData} />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <DataTable columns={targetColumns} data={transformedData} />
        </TabPanel>
      </CardContent>
    </Card>
  );
}
