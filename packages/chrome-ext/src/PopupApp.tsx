import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Paper,
  CircularProgress,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import type { Profile, CsvEncoding } from '@core/types';
import { STORAGE_KEYS } from '@core/types';
import { parseCSV, generateCSV, downloadCSV } from '@core/utils/csv';
import { transformData } from '@core/utils/transform';
import { applyDataFilter } from '@core/utils/dataFilter';
import { injectSampleProfilesIfNeeded, SAMPLE_CSV_DATA } from './sampleProfiles';

const TOUR_COMPLETED_KEY = 'csv-mapper-popup-tour-completed';
const SUCCESS_AUTO_DISMISS_MS = 5000;

function loadProfiles(): Profile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

const TOUR_STEPS = [
  {
    label: 'プロファイル選択',
    description: 'サンプルプロファイルが3つ用意されています。まずは「顧客リスト変換」を選んでみましょう。',
  },
  {
    label: 'CSV読み込み',
    description: 'サンプルCSVを自動で読み込みます。実際の利用時はここでCSVファイルを選択します。',
  },
  {
    label: '変換＆ダウンロード',
    description: '「変換してダウンロード」を押すと、プロファイルの設定に基づいてCSVが変換されます。',
  },
];

const TOUR_SPOTLIGHT_SX = {
  outline: '2px solid',
  outlineColor: 'primary.main',
  outlineOffset: 2,
  borderRadius: 1,
} as const;

const ENCODING_LABELS: Record<CsvEncoding, string> = {
  'utf-8': 'UTF-8',
  sjis: 'Shift_JIS',
};

export default function PopupApp() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [encodingOverride, setEncodingOverride] = useState<CsvEncoding | ''>('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ツアー状態
  const [tourActive, setTourActive] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  // 初期化
  useEffect(() => {
    const injected = injectSampleProfilesIfNeeded();
    const loaded = loadProfiles();
    setProfiles(loaded);

    if (!injected) {
      try {
        const lastId = localStorage.getItem(STORAGE_KEYS.CURRENT_PROFILE_ID);
        if (lastId) {
          const parsed = JSON.parse(lastId);
          if (loaded.some((p) => p.id === parsed)) {
            setSelectedProfileId(parsed);
          }
        }
      } catch {
        // ignore
      }
    }

    if (localStorage.getItem(TOUR_COMPLETED_KEY) !== 'true') {
      setTourActive(true);
      setTourStep(0);
    }
  }, []);

  // 他タブでプロファイルが更新された場合に再読み込み
  useEffect(() => {
    const reload = () => setProfiles(loadProfiles());
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.PROFILES) reload();
    };
    const onVisibility = () => {
      if (document.visibilityState === 'visible') reload();
    };
    window.addEventListener('storage', onStorage);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('storage', onStorage);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  // 成功メッセージの自動非表示
  useEffect(() => {
    if (!success) return;
    const id = setTimeout(() => setSuccess(''), SUCCESS_AUTO_DISMISS_MS);
    return () => clearTimeout(id);
  }, [success]);

  const selectedProfile = useMemo(
    () => profiles.find((p) => p.id === selectedProfileId) ?? null,
    [profiles, selectedProfileId]
  );

  // プロファイル切替時はエンコーディング上書きをリセット
  useEffect(() => {
    setEncodingOverride('');
  }, [selectedProfileId]);

  const effectiveEncoding: CsvEncoding =
    encodingOverride || selectedProfile?.encoding || 'utf-8';

  const resetMessages = () => {
    setError('');
    setSuccess('');
  };

  const acceptFile = (file: File) => {
    setCsvFile(file);
    resetMessages();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) acceptFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!/\.csv$/i.test(file.name)) {
      setError('CSVファイルを指定してください');
      return;
    }
    acceptFile(file);
  };

  const doTransformAndDownload = useCallback(
    async (profile: Profile, file: File, encoding: CsvEncoding) => {
      const { columns: parsedColumns, data: parsedData } = await parseCSV(file, encoding);

      const sourceColumns = parsedColumns;
      const { targetColumns, mappings } = profile;
      const dataFilter = profile.dataFilter ?? {
        enabled: false,
        columnType: 'source' as const,
        columnId: '',
        pattern: '',
      };

      const transformed = transformData(parsedData, mappings, sourceColumns, targetColumns);
      const { filteredTransformed } = applyDataFilter(parsedData, transformed, dataFilter);

      const csvString = generateCSV(filteredTransformed, targetColumns);
      const outputName = file.name.replace(/\.csv$/i, '') + '_converted.csv';
      downloadCSV(csvString, outputName);

      return filteredTransformed.length;
    },
    []
  );

  const handleTransformAndDownload = async () => {
    if (!selectedProfile) {
      setError('プロファイルを選択してください');
      return;
    }
    if (!csvFile) {
      setError('CSVファイルを選択してください');
      return;
    }

    resetMessages();
    setLoading(true);

    try {
      const count = await doTransformAndDownload(selectedProfile, csvFile, effectiveEncoding);
      setSuccess(`${count}件を変換してダウンロードしました`);
    } catch (err) {
      setError(`変換エラー: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenFullApp = () => {
    if (typeof chrome !== 'undefined' && chrome.tabs?.create) {
      chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
    } else {
      window.open('index.html', '_blank');
    }
  };

  // ========================================
  // ツアー操作
  // ========================================
  const handleTourNext = async () => {
    if (tourStep === 0) {
      setSelectedProfileId('sample_profile_1');
      setTourStep(1);
    } else if (tourStep === 1) {
      const csvContent = SAMPLE_CSV_DATA['sample_profile_1'];
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const file = new File([blob], 'sample_customers.csv', { type: 'text/csv' });
      setCsvFile(file);
      setTourStep(2);
    } else if (tourStep === 2) {
      const profile = profiles.find((p) => p.id === 'sample_profile_1');
      if (profile) {
        const csvContent = SAMPLE_CSV_DATA['sample_profile_1'];
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const file = new File([blob], 'sample_customers.csv', { type: 'text/csv' });
        setLoading(true);
        try {
          const count = await doTransformAndDownload(profile, file, profile.encoding ?? 'utf-8');
          setSuccess(`${count}件を変換してダウンロードしました`);
        } catch (err) {
          setError(`変換エラー: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
          setLoading(false);
        }
      }
      setTourActive(false);
      localStorage.setItem(TOUR_COMPLETED_KEY, 'true');
    }
  };

  const handleTourSkip = () => {
    setTourActive(false);
    localStorage.setItem(TOUR_COMPLETED_KEY, 'true');
  };

  const handleStartTour = () => {
    setTourActive(true);
    setTourStep(0);
    setSelectedProfileId('');
    setCsvFile(null);
    resetMessages();
  };

  const filterTooltip = selectedProfile?.dataFilter?.enabled
    ? `${selectedProfile.dataFilter.columnType === 'source' ? '変換前' : '変換後'} カラムに対し /${selectedProfile.dataFilter.pattern}/ にマッチする行のみ出力`
    : '';

  return (
    <Box sx={{ width: 380, p: 2 }}>
      {/* ヘッダー */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography variant="subtitle1" fontWeight="bold">
          CSV マッピングツール
        </Typography>
        <Box>
          {!tourActive && (
            <Tooltip title="ツアーを再開">
              <IconButton size="small" onClick={handleStartTour}>
                <RestartAltIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="フルエディタを開く">
            <IconButton size="small" onClick={handleOpenFullApp}>
              <OpenInNewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* ツアーガイド */}
      {tourActive && (
        <Paper
          elevation={0}
          sx={{
            mb: 2,
            p: 1.5,
            bgcolor: 'primary.50',
            border: '1px solid',
            borderColor: 'primary.200',
            borderRadius: 1,
          }}
        >
          <Stepper activeStep={tourStep} alternativeLabel sx={{ mb: 1.5 }}>
            {TOUR_STEPS.map((step) => (
              <Step key={step.label}>
                <StepLabel
                  slotProps={{
                    label: { sx: { fontSize: '0.75rem' } },
                  }}
                >
                  {step.label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
          <Typography variant="body2" sx={{ mb: 1.5, lineHeight: 1.6 }}>
            {TOUR_STEPS[tourStep].description}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button size="small" onClick={handleTourSkip} color="inherit">
              スキップ
            </Button>
            <Button
              size="small"
              variant="contained"
              startIcon={tourStep === 2 ? <DownloadIcon /> : <PlayArrowIcon />}
              onClick={handleTourNext}
            >
              {tourStep === 0 ? 'プロファイルを選択' : tourStep === 1 ? 'サンプルCSVを読込' : '変換してダウンロード'}
            </Button>
          </Box>
        </Paper>
      )}

      {/* プロファイル選択 */}
      <FormControl
        fullWidth
        sx={{
          mb: 2,
          ...(tourActive && tourStep === 0 ? TOUR_SPOTLIGHT_SX : {}),
        }}
      >
        <InputLabel>プロファイル</InputLabel>
        <Select
          value={selectedProfileId}
          label="プロファイル"
          onChange={(e) => {
            setSelectedProfileId(e.target.value);
            resetMessages();
          }}
        >
          {profiles.length === 0 && (
            <MenuItem disabled value="">
              プロファイルがありません
            </MenuItem>
          )}
          {profiles.map((p) => (
            <MenuItem key={p.id} value={p.id}>
              {p.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* プロファイル情報 */}
      {selectedProfile && (
        <Box sx={{ mb: 2, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          <Chip
            size="small"
            label={`変換前: ${selectedProfile.sourceColumns.length}列`}
            variant="outlined"
          />
          <Chip
            size="small"
            label={`変換後: ${selectedProfile.targetColumns.length}列`}
            variant="outlined"
          />
          <Chip
            size="small"
            label={`マッピング: ${selectedProfile.mappings.length}件`}
            variant="outlined"
          />
          {selectedProfile.dataFilter?.enabled && (
            <Tooltip title={filterTooltip}>
              <Chip size="small" label="フィルターON" variant="outlined" color="warning" />
            </Tooltip>
          )}
        </Box>
      )}

      {/* エンコーディング */}
      {selectedProfile && (
        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>エンコーディング</InputLabel>
          <Select
            value={effectiveEncoding}
            label="エンコーディング"
            onChange={(e) => setEncodingOverride(e.target.value as CsvEncoding)}
          >
            {(['utf-8', 'sjis'] as CsvEncoding[]).map((enc) => (
              <MenuItem key={enc} value={enc}>
                {ENCODING_LABELS[enc]}
                {enc === selectedProfile.encoding && encodingOverride === '' && '（プロファイル設定）'}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {/* CSVファイル選択（ドロップゾーン兼用） */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <Box
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        sx={{
          mb: 1,
          borderRadius: 1,
          ...(isDragOver
            ? {
                outline: '2px dashed',
                outlineColor: 'primary.main',
                bgcolor: 'primary.50',
              }
            : {}),
          ...(tourActive && tourStep === 1 ? TOUR_SPOTLIGHT_SX : {}),
        }}
      >
        <Button
          fullWidth
          variant="outlined"
          startIcon={<UploadFileIcon />}
          onClick={() => fileInputRef.current?.click()}
          sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
        >
          {csvFile ? csvFile.name : 'CSVファイルを選択 / ドロップ...'}
        </Button>
      </Box>

      {/* 変換＆ダウンロード */}
      <Button
        fullWidth
        variant="contained"
        color="success"
        startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <DownloadIcon />}
        onClick={handleTransformAndDownload}
        disabled={!selectedProfile || !csvFile || loading}
        sx={{
          mb: 1.5,
          ...(tourActive && tourStep === 2 ? TOUR_SPOTLIGHT_SX : {}),
        }}
      >
        {loading ? '変換中...' : '変換してダウンロード'}
      </Button>

      {/* メッセージ */}
      {error && (
        <Alert severity="error" sx={{ mb: 1 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert
          severity="success"
          icon={<CheckCircleIcon />}
          sx={{ mb: 1 }}
          onClose={() => setSuccess('')}
        >
          {success}
        </Alert>
      )}

      {/* プロファイル未作成ガイド */}
      {!tourActive && profiles.length === 0 && (
        <Alert severity="info" sx={{ mt: 1 }}>
          フルエディタでプロファイルを作成してください
        </Alert>
      )}
    </Box>
  );
}
