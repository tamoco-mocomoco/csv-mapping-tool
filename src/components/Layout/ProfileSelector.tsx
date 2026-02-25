import { useState, useRef } from 'react';
import {
  Box,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  IconButton,
  Typography,
  Chip,
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useMappingContext } from '../../contexts/MappingContext';
import type { Profile } from '../../types';

export function ProfileSelector() {
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
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [overwriteDialogOpen, setOverwriteDialogOpen] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);

  const currentProfile = profiles.find((p) => p.id === currentProfileId);
  const menuOpen = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSaveNew = () => {
    handleMenuClose();
    setProfileName('');
    setSaveDialogOpen(true);
  };

  const handleSaveDialogClose = () => {
    setSaveDialogOpen(false);
    setProfileName('');
  };

  const handleSaveConfirm = () => {
    if (!profileName.trim()) return;
    saveProfile(profileName.trim());
    handleSaveDialogClose();
  };

  const handleLoadProfile = (profileId: string) => {
    loadProfile(profileId);
    handleMenuClose();
  };

  const handleUpdateCurrent = () => {
    updateCurrentProfile();
    handleMenuClose();
  };

  const handleDeleteProfile = (profileId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (window.confirm('このプロファイルを削除しますか？')) {
      deleteProfile(profileId);
    }
  };

  const handleRenameOpen = (profileId: string, name: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setEditingProfileId(profileId);
    setProfileName(name);
    setRenameDialogOpen(true);
    handleMenuClose();
  };

  const handleRenameClose = () => {
    setRenameDialogOpen(false);
    setEditingProfileId(null);
    setProfileName('');
  };

  const handleRenameConfirm = () => {
    if (!editingProfileId || !profileName.trim()) return;
    renameProfile(editingProfileId, profileName.trim());
    handleRenameClose();
  };

  // エクスポート
  const handleExportProfile = (profile: Profile, event: React.MouseEvent) => {
    event.stopPropagation();
    const exportData = {
      name: profile.name,
      sourceColumns: profile.sourceColumns,
      targetColumns: profile.targetColumns,
      mappings: profile.mappings,
      encoding: profile.encoding,
      dataFilter: profile.dataFilter,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${profile.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // インポート
  const handleImportClick = () => {
    handleMenuClose();
    // メニューが閉じてからファイル選択ダイアログを開く
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 100);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // バリデーション
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

      // 名前重複チェック
      const existing = getProfileByName(profile.name);
      if (existing) {
        pendingImportProfileRef.current = profile;
        setOverwriteDialogOpen(true);
      } else {
        importProfile(profile);
      }
    } catch {
      alert('プロファイルファイルの読み込みに失敗しました');
    }

    // ファイル入力をリセット
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleOverwriteConfirm = () => {
    if (pendingImportProfileRef.current) {
      importProfile(pendingImportProfileRef.current, true);
    }
    setOverwriteDialogOpen(false);
    pendingImportProfileRef.current = null;
  };

  const handleOverwriteCancel = () => {
    setOverwriteDialogOpen(false);
    pendingImportProfileRef.current = null;
  };

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {currentProfile && (
          <Chip
            label={currentProfile.name}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}
          />
        )}
        <Button
          color="inherit"
          onClick={handleMenuOpen}
          endIcon={<KeyboardArrowDownIcon />}
          startIcon={<FolderIcon />}
        >
          プロファイル
        </Button>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleSaveNew}>
          <ListItemIcon>
            <AddIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>新規保存</ListItemText>
        </MenuItem>

        {currentProfileId && (
          <MenuItem onClick={handleUpdateCurrent}>
            <ListItemIcon>
              <SaveIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>上書き保存</ListItemText>
          </MenuItem>
        )}

        <Divider />

        <MenuItem onClick={handleImportClick}>
          <ListItemIcon>
            <FileUploadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>インポート</ListItemText>
        </MenuItem>

        {profiles.length > 0 && <Divider />}

        {profiles.length === 0 ? (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">
              保存済みプロファイルなし
            </Typography>
          </MenuItem>
        ) : (
          profiles.map((profile) => (
            <MenuItem
              key={profile.id}
              onClick={() => handleLoadProfile(profile.id)}
              selected={profile.id === currentProfileId}
            >
              <ListItemText
                primary={profile.name}
                secondary={new Date(profile.updatedAt).toLocaleDateString()}
              />
              <Box sx={{ ml: 1 }}>
                <IconButton
                  size="small"
                  onClick={(e) => handleExportProfile(profile, e)}
                  title="エクスポート"
                >
                  <FileDownloadIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={(e) => handleRenameOpen(profile.id, profile.name, e)}
                  title="名前変更"
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={(e) => handleDeleteProfile(profile.id, e)}
                  title="削除"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </MenuItem>
          ))
        )}
      </Menu>

      {/* 新規保存ダイアログ */}
      <Dialog open={saveDialogOpen} onClose={handleSaveDialogClose}>
        <DialogTitle>プロファイルを保存</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="プロファイル名"
            fullWidth
            variant="outlined"
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleSaveConfirm();
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSaveDialogClose}>キャンセル</Button>
          <Button onClick={handleSaveConfirm} variant="contained">
            保存
          </Button>
        </DialogActions>
      </Dialog>

      {/* 名前変更ダイアログ */}
      <Dialog open={renameDialogOpen} onClose={handleRenameClose}>
        <DialogTitle>プロファイル名を変更</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="プロファイル名"
            fullWidth
            variant="outlined"
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleRenameConfirm();
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRenameClose}>キャンセル</Button>
          <Button onClick={handleRenameConfirm} variant="contained">
            変更
          </Button>
        </DialogActions>
      </Dialog>

      {/* 上書き確認ダイアログ */}
      <Dialog open={overwriteDialogOpen} onClose={handleOverwriteCancel}>
        <DialogTitle>プロファイルの上書き確認</DialogTitle>
        <DialogContent>
          <DialogContentText>
            「{pendingImportProfileRef.current?.name}」という名前のプロファイルは既に存在します。
            上書きしますか？
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleOverwriteCancel}>キャンセル</Button>
          <Button onClick={handleOverwriteConfirm} variant="contained" color="warning">
            上書き
          </Button>
        </DialogActions>
      </Dialog>

      {/* ファイル入力（非表示） */}
      <input
        type="file"
        accept=".json"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </>
  );
}
