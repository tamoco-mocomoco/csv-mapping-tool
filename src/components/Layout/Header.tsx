import { AppBar, Toolbar, Typography, Button, Box, IconButton, Tooltip } from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useMappingContext } from '../../contexts/MappingContext';
import { ProfileSelector } from './ProfileSelector';

interface HeaderProps {
  onStartTour?: () => void;
}

export function Header({ onStartTour }: HeaderProps) {
  const { resetAll } = useMappingContext();

  const handleReset = () => {
    if (window.confirm('すべての設定をリセットしますか？')) {
      resetAll();
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
          CSV マッピングツール
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Box data-tour="profile">
            <ProfileSelector />
          </Box>
          <Button
            color="inherit"
            startIcon={<RestartAltIcon />}
            onClick={handleReset}
          >
            リセット
          </Button>
          {onStartTour && (
            <Tooltip title="使い方ガイド">
              <IconButton color="inherit" onClick={onStartTour}>
                <HelpOutlineIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
