import ResultsDisplay from './ResultsDisplay';
import { useState, useRef } from 'react';
import { Container, Typography, Box, Button, Chip, LinearProgress, Alert } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { createWorker } from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

export default function OcrDemo() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ status: string; value: number }>({ status: '', value: 0 });
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setError('Loại file không hợp lệ. Vui lòng chọn ảnh (JPG, PNG) hoặc PDF.');
      setSelectedFile(null);
    } else {
      setError('');
      setExtractedText(null);
      setSelectedFile(file);
    }
  };

  const handleSelectFileClick = () => { fileInputRef.current?.click(); };
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProcessClick = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setError('');
    setExtractedText(null);
    setProgress({ status: 'Bắt đầu...', value: 0 });

    try {
      let fullText = '';
      const worker = await createWorker('eng+chi_tra', 1, {
        logger: m => {
          if (m.status === 'recognizing text') {
            const pageProgress = Math.round(m.progress * 100);
            setProgress(prev => ({ ...prev, value: pageProgress }));
          }
        },
      });

      if (selectedFile.type === 'application/pdf') {
        const fileReader = new FileReader();
        fileReader.readAsArrayBuffer(selectedFile);
        await new Promise<void>(resolve => fileReader.onload = () => resolve());
        const pdf = await pdfjsLib.getDocument(fileReader.result as ArrayBuffer).promise;
        const numPages = pdf.numPages;

        for (let i = 1; i <= numPages; i++) {
          setProgress({ status: `Đang xử lý trang ${i}/${numPages}...`, value: 0 });
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 2.0 }); // Tăng scale để nét hơn
          const canvas = canvasRef.current!;
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          const context = canvas.getContext('2d')!;
          await page.render({ canvasContext: context, viewport: viewport, canvas: canvas }).promise;
          
          const imageForOcr = canvas.toDataURL('image/jpeg');
          const { data: { text } } = await worker.recognize(imageForOcr);
          fullText += text + '\n\n--- Hết Trang --- \n\n';
        }
      } else {
        // Xử lý file ảnh như cũ
        setProgress({ status: 'Đang xử lý ảnh...', value: 0 });
        const { data: { text } } = await worker.recognize(selectedFile);
        fullText = text;
      }
      
      setExtractedText(fullText);
      await worker.terminate();

    } catch (err) {
      console.error("Lỗi trong quá trình xử lý:", err);
      setError('Đã xảy ra lỗi. Vui lòng kiểm tra console để biết chi tiết.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ pb: 8 }}>
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>Demo Information Extraction</Typography>
        <Typography variant="subtitle1" color="text.secondary">Tải lên file (PDF/Ảnh) để trích xuất dữ liệu</Typography>
      </Box>
      <Box sx={{ border: '2px dashed grey', borderRadius: 2, p: 4, textAlign: 'center' }}>
        <input ref={fileInputRef} type="file" hidden accept={ALLOWED_FILE_TYPES.join(',')} onChange={handleFileChange} />
        <Button variant="outlined" startIcon={<UploadFileIcon />} onClick={handleSelectFileClick}>Chọn File (PDF/Ảnh)</Button>
        {selectedFile && <Box sx={{ mt: 2 }}><Chip label={selectedFile.name} onDelete={() => setSelectedFile(null)} /></Box>}
        <Box sx={{ mt: 3 }}>
          <Button variant="contained" size="large" onClick={handleProcessClick} disabled={!selectedFile || isLoading}>
            {isLoading ? 'Đang xử lý...' : 'Bắt đầu xử lý'}
          </Button>
        </Box>
        {isLoading && (
          <Box sx={{ width: '100%', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">{`${progress.status} ${progress.value}%`}</Typography>
            <LinearProgress variant="determinate" value={progress.value} />
          </Box>
        )}
        {error && <Alert severity="error" sx={{ mt: 2, textAlign: 'left' }}>{error}</Alert>}
      </Box>
      {!isLoading && extractedText && <ResultsDisplay text={extractedText} />}
    </Container>
  );
}