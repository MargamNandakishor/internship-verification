import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Tab,
  Tabs,
  TextField,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index} style={{ padding: '20px 0' }}>
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      setError('');
      const response = await axios.post(`${API_BASE_URL}/analyze/document`, formData);
      navigate(`/analysis/${response.data.id}`, { state: { result: response.data } });
    } catch (err) {
      setError(err.response?.data?.detail || 'Error analyzing document');
    } finally {
      setLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
  });

  const handleTextAnalysis = async () => {
    if (!text.trim()) return;

    try {
      setLoading(true);
      setError('');
      const response = await axios.post(`${API_BASE_URL}/analyze/text`, { text });
      navigate(`/analysis/${response.data.id}`, { state: { result: response.data } });
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.detail || 'Error analyzing text');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Verify Your Offer Letter
      </Typography>
      <Typography variant="subtitle1" gutterBottom align="center" color="text.secondary">
        Upload your document or paste the text to verify its authenticity
      </Typography>

      <Paper sx={{ mt: 4 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          centered
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<CloudUploadIcon />} label="Upload Document" />
          <Tab icon={<TextSnippetIcon />} label="Paste Text" />
        </Tabs>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        <TabPanel value={tabValue} index={0}>
          <Box
            {...getRootProps()}
            sx={{
              border: '2px dashed',
              borderColor: isDragActive ? 'primary.main' : 'grey.300',
              borderRadius: 1,
              p: 3,
              textAlign: 'center',
              cursor: 'pointer',
              '&:hover': {
                borderColor: 'primary.main',
              },
            }}
          >
            <input {...getInputProps()} />
            <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography>
              {isDragActive
                ? 'Drop the file here'
                : 'Drag and drop your document here, or click to select'}
            </Typography>
            <Typography variant="caption" display="block" color="text.secondary">
              Supported formats: PDF, DOC, DOCX
            </Typography>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <TextField
            multiline
            rows={8}
            fullWidth
            placeholder="Paste your offer letter text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            variant="outlined"
          />
          <Button
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
            onClick={handleTextAnalysis}
            disabled={loading || !text.trim()}
          >
            {loading ? <CircularProgress size={24} /> : 'Analyze Text'}
          </Button>
        </TabPanel>
      </Paper>

      <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4 }}>
        Your document will be analyzed securely and confidentially
      </Typography>
    </Box>
  );
} 