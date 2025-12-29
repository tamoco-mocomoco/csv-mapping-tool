import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useMappingContext } from '../../contexts/MappingContext';
import { ProfileSelector } from './ProfileSelector';

export function Header() {
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
          <ProfileSelector />
          <Button
            color="inherit"
            startIcon={<RestartAltIcon />}
            onClick={handleReset}
          >
            リセット
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
