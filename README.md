<h1 align="center">Insurance Form OCR Extraction Demo</h1>
<p align="center">
  <a href="https://visitorbadge.io/status?path=https%3A%2F%2Fgithub.com%2FPB3002%2FInsurance-Form-Extraction"><img src="https://api.visitorbadge.io/api/visitors?path=https%3A%2F%2Fgithub.com%2FPB3002%2FInsurance-Form-Extraction&countColor=%232ccce4" /></a>
  
  <a href="https://www.linkedin.com/in/nguyenphuc-mrp/">
    <img src="https://img.shields.io/badge/linkedin-%230077B5.svg?style=for-the-badge&logo=linkedin&logoColor=white" alt="Linkedin"></a>
    
  <a href="https://mail.google.com/mail/u/0/?tab=rm&ogbl#inbox?compose=GTvVlcSHvbQxNwkWrmstDrLfwbmwrCXwrRXtjZqKfkwSpmdJSzBKjlwQhJDNbRZvgskkCpXjnPgKq">
    <img src="https://img.shields.io/badge/Gmail-D14836?style=for-the-badge&logo=gmail&logoColor=white" alt="Gmail">
  </a>
  
  <br>
  <img src="https://img.shields.io/badge/Typescript-FFD43B?style=for-the-badge&logo=Typescript&logoColor=blue" />
  <img src="https://img.shields.io/badge/VSCode-0078D4?style=for-the-badge&logo=visual%20studio%20code&logoColor=white" />
</p>
This project is a functional web-based demo designed to showcase the power of client-side AI in streamlining document processing. It allows users to upload an insurance claim form (in PDF or Image format) and automatically extracts key handwritten information, presenting it in a structured format.

The entire process runs directly in the user's browser, ensuring data privacy and requiring no backend infrastructure or API keys.

## Key Features

-   **PDF & Image Support:** Accepts both multi-page PDF files and common image formats (`.jpg`, `.png`).
-   **Client-Side OCR:** Performs Optical Character Recognition directly in the browser using Tesseract.js. No data is sent to a server.
-   **Multi-Page PDF Processing:** Automatically iterates through all pages of a PDF, converts them to images, and aggregates the OCR results.
-   **Multi-Language Recognition:** Configured to recognize both **English** and **Traditional Chinese** (`eng+chi_tra`) to handle bilingual forms.
-   **Intelligent Data Extraction:** Uses a rule-based AI approach (Regular Expressions) to parse the raw OCR text and extract specific, meaningful fields from a fixed form template.
-   **Responsive UI:** Built with Material-UI for a clean, modern, and easy-to-use interface.

## Technical Stack

-   **Frontend:** **React.js** (with TypeScript)
-   **Build Tool:** **Vite**
-   **UI Library:** **Material-UI (MUI)**
-   **AI / OCR Engine:** **Tesseract.js**
-   **PDF Handling:** **PDF.js** (by Mozilla)

## How It Works

The application follows a four-step, client-side pipeline to extract information:

1.  **File Input:** The user selects a local PDF or image file. The application validates the file type.
2.  **PDF-to-Image Conversion:** If the file is a PDF, `pdf.js` is used to render each page onto a hidden `<canvas>` element. This canvas is then converted into a high-resolution image data URL.
3.  **OCR Processing:** The generated image (or the original user-uploaded image) is passed to a `Tesseract.js` worker. The worker processes the image, recognizes characters for both English and Chinese, and returns the full raw text.
4.  **Intelligent Parsing:** The aggregated raw text is passed to a dedicated parsing function. This function uses a set of highly specific Regular Expressions designed to match the fixed layout of the insurance form, accurately extracting the handwritten values associated with predefined fields. The final structured data is then displayed to the user.

## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

-   [Node.js](https://nodejs.org/) (version 16.x or later)
-   [npm](https://www.npmjs.com/) (usually comes with Node.js)

### Installation & Running

1.  **Clone the repository:**
    ```bash
    git clone https://your-repository-url.git
    ```

2.  **Navigate to the project directory:**
    ```bash
    cd your-project-name
    ```

3.  **Install the dependencies:**
    ```bash
    npm install
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

The application will now be running and available at `http://localhost:5173` (or the next available port).

## Project Structure

The core logic of the application is contained within two main files:

-   `src/OcrDemo.tsx`: The main component that handles UI, state management, file uploads, and the overall processing pipeline (calling PDF.js and Tesseract.js).
-   `src/ResultsDisplay.tsx`: A dedicated component for displaying results. It contains the crucial data parsing logic (`parseFixedFormData` function) that transforms raw text into structured key-value pairs.

