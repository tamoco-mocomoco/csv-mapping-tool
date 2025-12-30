import { Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import type { ConverterConfig, ConverterType } from '../../types';
import { SplitConfig } from './SplitConfig';
import { ReplaceConfig } from './ReplaceConfig';
import { PrefixConfig } from './PrefixConfig';
import { SuffixConfig } from './SuffixConfig';
import { TrimConfig } from './TrimConfig';
import { CaseConfig } from './CaseConfig';
import { SubstringConfig } from './SubstringConfig';
import { PaddingConfig } from './PaddingConfig';

interface ConverterSelectProps {
  config: ConverterConfig;
  onChange: (config: ConverterConfig) => void;
}

export function ConverterSelect({ config, onChange }: ConverterSelectProps) {
  const handleTypeChange = (type: ConverterType) => {
    // タイプ変更時にデフォルト設定を適用
    const newConfig: ConverterConfig = { type };

    switch (type) {
      case 'split':
        newConfig.delimiter = ' ';
        newConfig.index = 0;
        break;
      case 'replace':
        newConfig.searchValue = '';
        newConfig.replaceValue = '';
        break;
      case 'prefix':
        newConfig.prefixType = 'fixed';
        newConfig.fixedPrefix = '';
        break;
      case 'suffix':
        newConfig.suffix = '';
        break;
      case 'trim':
        newConfig.trimType = 'both';
        break;
      case 'case':
        newConfig.caseType = 'upper';
        break;
      case 'substring':
        newConfig.substringStart = 0;
        break;
      case 'padding':
        newConfig.padType = 'start';
        newConfig.padChar = '0';
        newConfig.padLength = 0;
        break;
    }

    onChange(newConfig);
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap' }}>
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>コンバーター</InputLabel>
        <Select
          value={config.type}
          label="コンバーター"
          onChange={(e) => handleTypeChange(e.target.value as ConverterType)}
          data-testid="converter-type-select"
        >
          <MenuItem value="direct">そのまま</MenuItem>
          <MenuItem value="split">分割</MenuItem>
          <MenuItem value="replace">置換</MenuItem>
          <MenuItem value="prefix">接頭辞付与</MenuItem>
          <MenuItem value="suffix">接尾辞付与</MenuItem>
          <MenuItem value="trim">トリム</MenuItem>
          <MenuItem value="case">大文字/小文字</MenuItem>
          <MenuItem value="substring">部分抽出</MenuItem>
          <MenuItem value="padding">パディング</MenuItem>
        </Select>
      </FormControl>

      {config.type === 'split' && (
        <SplitConfig config={config} onChange={onChange} />
      )}

      {config.type === 'replace' && (
        <ReplaceConfig config={config} onChange={onChange} />
      )}

      {config.type === 'prefix' && (
        <PrefixConfig config={config} onChange={onChange} />
      )}

      {config.type === 'suffix' && (
        <SuffixConfig config={config} onChange={onChange} />
      )}

      {config.type === 'trim' && (
        <TrimConfig config={config} onChange={onChange} />
      )}

      {config.type === 'case' && (
        <CaseConfig config={config} onChange={onChange} />
      )}

      {config.type === 'substring' && (
        <SubstringConfig config={config} onChange={onChange} />
      )}

      {config.type === 'padding' && (
        <PaddingConfig config={config} onChange={onChange} />
      )}
    </Box>
  );
}
