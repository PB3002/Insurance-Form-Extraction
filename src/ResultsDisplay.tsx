// src/ResultsDisplay.tsx

import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Alert,
} from '@mui/material';
import { useState, useMemo } from 'react';

// === HÀM BÓC TÁCH DỮ LIỆU SIÊU CHÍNH XÁC (PHIÊN BẢN 4.0 - CUỐI CÙNG) ===
const parseFixedFormData = (text: string) => {
  const extracted: { [key: string]: string | null } = {};

  // Hàm trợ giúp chính: Tìm một từ khóa và lấy giá trị trên CÙNG MỘT DÒNG.
  // [^\n] có nghĩa là "bất kỳ ký tự nào KHÔNG phải là ký tự xuống dòng".
  // Đây là chìa khóa để ngăn việc lấy văn bản tràn sang các dòng khác.
  const extractSingleLineValue = (pattern: RegExp, data: string): string | null => {
    const match = data.match(pattern);
    // Group 1 là giá trị chúng ta muốn, làm sạch nó.
    return match && match[1] ? match[1].replace(/:/g, '').trim() : null;
  };

  // Hàm tìm giá trị ở dòng tiếp theo, vẫn rất hữu ích.
  const getValueOnNextLine = (keyword: RegExp, data: string): string | null => {
    const regex = new RegExp(keyword.source + '[^\\n]*\\n\\s*([^\\n]+)', 'i');
    const match = data.match(regex);
    return match && match[1] ? match[1].trim() : null;
  };

  // Hàm kiểm tra checkbox, được tối ưu.
  const isCheckboxChecked = (keyword: string, data: string): boolean => {
    const regex = new RegExp(keyword + '\\s*\\[(.)\\]', 'is');
    const match = data.match(regex);
    return match ? match[1].trim() !== '' && match[1].trim() !== ']' : false;
  };

  // === CÁC MẪU REGEX ĐƯỢC THIẾT KẾ RIÊNG CHO TỪNG TRƯỜNG ===
  extracted['Name of Policyowner / Employee / Member'] = extractSingleLineValue(/Name of Policyowner \/ Employee \/ Member[^\n]*\s*([^\n]+)/i, text);
  extracted['Name of Insured'] = extractSingleLineValue(/Name of Insured 受保人姓名\s*([^\n]+)/i, text);
  extracted['Occupation'] = extractSingleLineValue(/Occupation 職業\s*([^\n]+)/i, text);
  extracted['Date of Birth'] = extractSingleLineValue(/Date of Birth 出生日期\s*([^\n]+)/i, text);
  extracted['HKID / Passport No.'] = extractSingleLineValue(/HKID \/ Passport No\.\s*([^\n]+)/i, text);
  
  extracted["Doctor's Name"] = extractSingleLineValue(/Doctor's Name 醫生姓名\s*([^\n]+)/i, text);
  extracted['Address'] = extractSingleLineValue(/Address 地址\s*([^\n]+)/i, text);
  extracted['Treatment Date'] = extractSingleLineValue(/Treatment Date 診治日期:[^\n]*?\s*([^\n]+)/i, text);

  extracted['Did you submit this insurance claim to other insurance company?'] = isCheckboxChecked('Yes', text) ? 'Yes' : 'No';
  extracted['Have you had any prior treatment for this or related condition?'] = isCheckboxChecked('Yes', text) ? 'Yes' : 'No';
  extracted['Was the hospitalization / surgery a result of an accident?'] = isCheckboxChecked('Yes', text) ? 'Yes' : 'No';
  
  extracted['Name of Account Holder'] = getValueOnNextLine(/Name of Account Holder/i, text);
  extracted['Bank Account No.'] = extractSingleLineValue(/Bank Account No\.\s*([^\n]+)/i, text);
  extracted['Hong Kong Mobile Phone Number (FPS)'] = extractSingleLineValue(/Hong Kong Mobile Phone Number\s*([^\n]+)/i, text);

  // Lọc ra những kết quả rỗng (null) để chỉ hiển thị các trường tìm thấy
  const finalResult: { [key: string]: string } = {};
  for (const key in extracted) {
    if (extracted[key] && extracted[key]!.length > 0) {
      finalResult[key] = extracted[key] as string;
    }
  }
  return finalResult;
};

interface ResultsDisplayProps {
  text: string;
}

export default function ResultsDisplay({ text }: ResultsDisplayProps) {
  const [tabIndex, setTabIndex] = useState(0);
  const parsedData = useMemo(() => parseFixedFormData(text), [text]);

  return (
    <Paper elevation={3} sx={{ mt: 4, p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Extracted Information
      </Typography>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabIndex} onChange={(e, v) => setTabIndex(v)} aria-label="results tabs">
          <Tab label="Handwritten Data" />
          <Tab label="Raw OCR Text" />
        </Tabs>
      </Box>

      {tabIndex === 0 && (
        <Box sx={{ py: 2 }}>
          {Object.keys(parsedData).length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableBody>
                  {Object.entries(parsedData).map(([key, value]) => (
                    <TableRow key={key} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', width: '40%' }}>
                        {key}
                      </TableCell>
                      <TableCell sx={{ color: 'primary.main', fontWeight: 'medium', fontFamily: 'monospace' }}>
                        {value}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Could not find any data matching the predefined fields.
            </Alert>
          )}
        </Box>
      )}

      {tabIndex === 1 && (
        <Box
          component="pre"
          sx={{
            py: 2, whiteSpace: 'pre-wrap', wordBreak: 'break-word', 
            maxHeight: '400px', overflowY: 'auto', bgcolor: 'action.hover', 
            p: 2, borderRadius: 1
          }}
        >
          {text}
        </Box>
      )}
    </Paper>
  );
}