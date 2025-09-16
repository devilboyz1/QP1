import React from 'react';
import {
  Backdrop,
  CircularProgress,
  Typography,
  Box,
  LinearProgress,
  Fade,
} from '@mui/material';

const LoadingOverlay = ({ 
  open, 
  message = 'Loading...', 
  progress = null, 
  variant = 'circular' 
}) => {
  return (
    <Backdrop
      sx={{
        color: '#fff',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        flexDirection: 'column',
        gap: 2,
      }}
      open={open}
    >
      <Fade in={open}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            p: 3,
            borderRadius: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
          }}
        >
          {variant === 'circular' ? (
            <CircularProgress 
              size={60} 
              thickness={4}
              value={progress}
              variant={progress !== null ? 'determinate' : 'indeterminate'}
            />
          ) : (
            <Box sx={{ width: 300 }}>
              <LinearProgress 
                value={progress}
                variant={progress !== null ? 'determinate' : 'indeterminate'}
              />
            </Box>
          )}
          
          <Typography variant="h6" component="div">
            {message}
          </Typography>
          
          {progress !== null && (
            <Typography variant="body2" color="text.secondary">
              {Math.round(progress)}% complete
            </Typography>
          )}
        </Box>
      </Fade>
    </Backdrop>
  );
};

export default LoadingOverlay;