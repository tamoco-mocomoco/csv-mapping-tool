import { useRef, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Stack,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Alert,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useMappingContext } from '../../contexts/MappingContext';
import type { Profile } from '../../types';

export function ProfilePanel() {
  const {
    profiles,
    currentProfileId,
    saveProfile,
    loadProfile,
    deleteProfile,
    renameProfile,
    updateCurrentProfile,
    importProfile,
    getProfileByName,
  } = useMappingContext();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingImportProfileRef = useRef<Profile | null>(null);

  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [overwriteDialogOpen, setOverwriteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Profile | null>(null);
  const [profileName, setProfileName] = useState('');
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);

  const currentProfile = profiles.find((p) => p.id === currentProfileId) ?? null;

  // ----- 新規保存 -----
  const handleSaveNewOpen = () => {
    setProfileName('');
    setSaveDialogOpen(true);
  };
  const handleSaveConfirm = () => {
    if (!profileName.trim()) return;
    saveProfile(profileName.trim());
    setSaveDialogOpen(false);
  };

  // ----- 名前変更 -----
  const handleRenameOpen = (profile: Profile) => {
    setEditingProfileId(profile.id);
    setProfileName(profile.name);
    setRenameDialogOpen(true);
  };
  const handleRenameConfirm = () => {
    if (!editingProfileId || !profileName.trim()) return;
    renameProfile(editingProfileId, profileName.trim());
    setRenameDialogOpen(false);
    setEditingProfileId(null);
  };

  // ----- 削除 -----
  const handleDeleteRequest = (profile: Profile) => setDeleteTarget(profile);
  const handleDeleteConfirm = () => {
    if (deleteTarget) deleteProfile(deleteTarget.id);
    setDeleteTarget(null);
  };

  // ----- エクスポート -----
  const handleExport = (profile: Profile) => {
    const exportData = {
      name: profile.name,
      sourceColumns: profile.sourceColumns,
      targetColumns: profile.targetColumns,
      mappings: profile.mappings,
      encoding: profile.encoding,
      dataFilter: profile.dataFilter,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${profile.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ----- インポート -----
  const handleImportClick = () => fileInputRef.current?.click();
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (!data.name || !data.sourceColumns || !data.targetColumns || !data.mappings) {
        alert('無効なプロファイルファイルです');
        return;
      }
      const profile: Profile = {
        id: '',
        name: data.name,
        sourceColumns: data.sourceColumns,
        targetColumns: data.targetColumns,
        mappings: data.mappings,
        encoding: data.encoding,
        dataFilter: data.dataFilter,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      if (getProfileByName(profile.name)) {
        pendingImportProfileRef.current = profile;
        setOverwriteDialogOpen(true);
      } else {
        importProfile(profile);
      }
    } catch {
      alert('プロファイルファイルの読み込みに失敗しました');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  const handleOverwriteConfirm = () => {
    if (pendingImportProfileRef.current) importProfile(pendingImportProfileRef.current, true);
    setOverwriteDialogOpen(false);
    pendingImportProfileRef.current = null;
  };

  return (
    <Box>
      {/* 現在のプロファイル */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="overline" color="text.secondary">
            現在の作業
          </Typography>
          {currentProfile ? (
            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
              <CheckCircleIcon color="success" />
              <Typography variant="h6">{currentProfile.name}</Typography>
              <Chip label={`最終更新 ${new Date(currentProfile.updatedAt).toLocaleString()}`} size="small" variant="outlined" />
              <Box sx={{ flexGrow: 1 }} />
              <Button
                size="small"
                variant="outlined"
                startIcon={<SaveIcon />}
                onClick={updateCurrentProfile}
              >
                上書き保存
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleSaveNewOpen}
              >
                別名で保存
              </Button>
            </Box>
          ) : (
            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
              <Typography color="text.secondary">プロファイル未選択 — 作業内容は一時保存のみです</Typography>
              <Box sx={{ flexGrow: 1 }} />
              <Button
                size="small"
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleSaveNewOpen}
              >
                新規保存
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* インポート */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="overline" color="text.secondary">
          保存済みプロファイル ({profiles.length})
        </Typography>
        <Button size="small" startIcon={<FileUploadIcon />} onClick={handleImportClick}>
          JSONインポート
        </Button>
        <input
          type="file"
          accept=".json"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </Box>

      {/* プロファイル一覧 */}
      {profiles.length === 0 ? (
        <Alert severity="info">
          保存済みプロファイルがありません。「新規保存」で作成するか、JSONファイルからインポートしてください。
        </Alert>
      ) : (
        <Stack spacing={1.5}>
          {profiles.map((profile) => {
            const isCurrent = profile.id === currentProfileId;
            return (
              <Card key={profile.id} variant="outlined" sx={isCurrent ? { borderColor: 'primary.main' } : {}}>
                <CardContent sx={{ '&:last-child': { pb: 2 }, py: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <FolderOpenIcon color={isCurrent ? 'primary' : 'action'} />
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {profile.name}
                        {isCurrent && <Chip label="使用中" size="small" color="primary" />}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        変換前 {profile.sourceColumns.length}列 / 変換後 {profile.targetColumns.length}列 / マッピング {profile.mappings.length}件
                        {' · '}
                        更新 {new Date(profile.updatedAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {!isCurrent && (
                        <Button size="small" variant="text" onClick={() => loadProfile(profile.id)}>
                          読込
                        </Button>
                      )}
                      <Tooltip title="エクスポート">
                        <IconButton size="small" onClick={() => handleExport(profile)}>
                          <FileDownloadIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="名前変更">
                        <IconButton size="small" onClick={() => handleRenameOpen(profile)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="削除">
                        <IconButton size="small" onClick={() => handleDeleteRequest(profile)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}

      {/* 新規保存ダイアログ */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
        <DialogTitle>プロファイルを保存</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="プロファイル名"
            fullWidth
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleSaveConfirm();
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>キャンセル</Button>
          <Button onClick={handleSaveConfirm} variant="contained">
            保存
          </Button>
        </DialogActions>
      </Dialog>

      {/* 名前変更ダイアログ */}
      <Dialog open={renameDialogOpen} onClose={() => setRenameDialogOpen(false)}>
        <DialogTitle>プロファイル名を変更</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="プロファイル名"
            fullWidth
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleRenameConfirm();
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenameDialogOpen(false)}>キャンセル</Button>
          <Button onClick={handleRenameConfirm} variant="contained">
            変更
          </Button>
        </DialogActions>
      </Dialog>

      {/* 削除確認ダイアログ */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>プロファイルを削除</DialogTitle>
        <DialogContent>
          <DialogContentText>
            「{deleteTarget?.name}」を削除します。元には戻せません。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>キャンセル</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error">
            削除
          </Button>
        </DialogActions>
      </Dialog>

      {/* 上書き確認ダイアログ */}
      <Dialog open={overwriteDialogOpen} onClose={() => setOverwriteDialogOpen(false)}>
        <DialogTitle>プロファイルの上書き確認</DialogTitle>
        <DialogContent>
          <DialogContentText>
            「{pendingImportProfileRef.current?.name}」という名前のプロファイルは既に存在します。上書きしますか？
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOverwriteDialogOpen(false)}>キャンセル</Button>
          <Button onClick={handleOverwriteConfirm} variant="contained" color="warning">
            上書き
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
