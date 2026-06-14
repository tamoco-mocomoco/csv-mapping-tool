import { useState, useCallback, useMemo, type ReactNode } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  StepButton,
  Button,
  Typography,
  Paper,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';

export interface WizardStep {
  label: string;
  description?: string;
  content: ReactNode;
}

interface WizardLayoutProps {
  steps: WizardStep[];
  activeStep?: number;
  onStepChange?: (step: number) => void;
  headerSlot?: ReactNode;
}

const SIDEBAR_WIDTH = 240;

export function WizardLayout({
  steps,
  activeStep: controlledStep,
  onStepChange,
  headerSlot,
}: WizardLayoutProps) {
  const theme = useTheme();
  const isCompact = useMediaQuery(theme.breakpoints.down('md'));

  const [uncontrolledStep, setUncontrolledStep] = useState(0);
  const activeStep = controlledStep ?? uncontrolledStep;

  const handleStepChange = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(steps.length - 1, next));
      if (controlledStep === undefined) setUncontrolledStep(clamped);
      onStepChange?.(clamped);
    },
    [controlledStep, onStepChange, steps.length]
  );

  const current = useMemo(() => steps[activeStep], [steps, activeStep]);
  const isFirst = activeStep === 0;
  const isLast = activeStep === steps.length - 1;

  return (
    <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
      {/* サイドバー */}
      {!isCompact && (
        <Paper
          square
          elevation={0}
          sx={{
            width: SIDEBAR_WIDTH,
            flexShrink: 0,
            borderRight: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            py: 3,
            px: 2,
          }}
        >
          <Typography variant="overline" color="text.secondary" sx={{ pl: 1 }}>
            ステップ
          </Typography>
          <Stepper activeStep={activeStep} orientation="vertical" nonLinear sx={{ mt: 1 }}>
            {steps.map((step, index) => (
              <Step key={step.label} completed={false}>
                <StepButton onClick={() => handleStepChange(index)}>
                  <StepLabel>{step.label}</StepLabel>
                </StepButton>
              </Step>
            ))}
          </Stepper>
        </Paper>
      )}

      {/* メインコンテンツ */}
      <Box sx={{ flex: 1, minWidth: 0, p: { xs: 2, md: 3 } }}>
        {/* コンパクト時の横ステッパー */}
        {isCompact && (
          <Paper elevation={0} sx={{ p: 1.5, mb: 2 }}>
            <Stepper activeStep={activeStep} nonLinear alternativeLabel>
              {steps.map((step, index) => (
                <Step key={step.label}>
                  <StepButton onClick={() => handleStepChange(index)}>
                    <StepLabel>{step.label}</StepLabel>
                  </StepButton>
                </Step>
              ))}
            </Stepper>
          </Paper>
        )}

        {/* タイトル */}
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, mb: 1 }}>
          <Typography variant="caption" color="text.secondary">
            STEP {activeStep + 1} / {steps.length}
          </Typography>
          <Typography variant="h5" component="h2" fontWeight={600}>
            {current.label}
          </Typography>
        </Box>
        {current.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {current.description}
          </Typography>
        )}
        {headerSlot && <Box sx={{ mb: 2 }}>{headerSlot}</Box>}

        <Divider sx={{ mb: 3 }} />

        {/* ステップ内容 */}
        <Box>{current.content}</Box>

        {/* ナビゲーション */}
        <Box
          sx={{
            mt: 4,
            display: 'flex',
            justifyContent: 'space-between',
            position: 'sticky',
            bottom: 0,
            bgcolor: 'background.default',
            py: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
            zIndex: 1,
          }}
        >
          <Button
            startIcon={<NavigateBeforeIcon />}
            onClick={() => handleStepChange(activeStep - 1)}
            disabled={isFirst}
          >
            戻る
          </Button>
          <Button
            variant="contained"
            endIcon={<NavigateNextIcon />}
            onClick={() => handleStepChange(activeStep + 1)}
            disabled={isLast}
          >
            次へ
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
