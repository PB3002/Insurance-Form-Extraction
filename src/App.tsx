import OcrDemo from './OcrDemo';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

// Tạo một theme cơ bản (Dark mode cho ngầu!)
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline /> {/* Giúp chuẩn hóa CSS trên các trình duyệt */}
      <OcrDemo />
    </ThemeProvider>
  );
}

export default App;