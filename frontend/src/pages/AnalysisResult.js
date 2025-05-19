import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  LinearProgress,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  VerifiedUser,
  Warning,
  Business,
  Description,
  ErrorOutline,
  CheckCircleOutline,
  ArrowBack,
  GetApp,
} from '@mui/icons-material';

export default function AnalysisResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const { result } = location.state || {};

  if (!result) {
    return (
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <ErrorOutline sx={{ fontSize: 64, color: 'error.main' }} />
        <Typography variant="h5" sx={{ mt: 2 }}>
          No analysis results found
        </Typography>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/')}
          sx={{ mt: 2 }}
        >
          Back to Home
        </Button>
      </Box>
    );
  }

  const {
    document_type,
    legitimacy_score,
    is_legitimate,
    confidence_score,
    company_info,
    warnings,
  } = result;

  const handleDownloadReport = () => {
    // TODO: Implement report download functionality
    console.log('Downloading report...');
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', mt: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/')}
        sx={{ mb: 4 }}
      >
        Back to Home
      </Button>

      <Grid container spacing={3}>
        {/* Main Analysis Result */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              {is_legitimate ? (
                <CheckCircleOutline
                  sx={{ fontSize: 48, color: 'success.main', mr: 2 }}
                />
              ) : (
                <ErrorOutline
                  sx={{ fontSize: 48, color: 'error.main', mr: 2 }}
                />
              )}
              <Box>
                <Typography variant="h4">
                  {is_legitimate ? 'Legitimate Document' : 'Suspicious Document'}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Confidence Score: {(confidence_score * 100).toFixed(1)}%
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Document Type */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Document Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Document Type
                    </Typography>
                    <Chip
                      icon={<Description />}
                      label={document_type.replace('_', ' ').toUpperCase()}
                      color="primary"
                      sx={{ mt: 1 }}
                    />
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Legitimacy Score
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={legitimacy_score * 100}
                        sx={{ height: 10, borderRadius: 5 }}
                      />
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {(legitimacy_score * 100).toFixed(1)}%
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Box>

            {/* Company Information */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Company Information
              </Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Company Name
                    </Typography>
                    <Typography variant="body1">
                      {company_info.name || 'Not detected'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Domain
                    </Typography>
                    <Typography variant="body1">
                      {company_info.domain || 'Not detected'}
                    </Typography>
                    <Chip
                      size="small"
                      icon={<VerifiedUser />}
                      label={company_info.verified ? 'Verified' : 'Unverified'}
                      color={company_info.verified ? 'success' : 'warning'}
                      sx={{ mt: 1 }}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Box>

            {/* Warnings */}
            {warnings.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Warnings
                </Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <List>
                    {warnings.map((warning, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <Warning color="warning" />
                        </ListItemIcon>
                        <ListItemText primary={warning} />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Box>
            )}

            {/* Actions */}
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                startIcon={<GetApp />}
                onClick={handleDownloadReport}
                sx={{ mr: 2 }}
              >
                Download Report
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/')}
              >
                Analyze Another Document
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
} 