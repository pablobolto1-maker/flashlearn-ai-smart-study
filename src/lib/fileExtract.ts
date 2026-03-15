import mammoth from 'mammoth';

export async function extractPDF(file: File): Promise<string> {
  // Load PDF.js dynamically
  if (!(window as any).pdfjsLib) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Impossible de charger PDF.js'));
      document.head.appendChild(script);
    });
  }
  const pdfjsLib = (window as any).pdfjsLib;
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item: any) => item.str).join(' ') + '\n';
  }
  if (text.trim().length < 50) {
    throw new Error('PDF scanné détecté. Le texte ne peut pas être extrait. Veuillez coller le texte manuellement.');
  }
  return text.trim();
}

export async function extractWord(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value.trim();
}

export async function extractExcel(file: File): Promise<string> {
  // Load SheetJS dynamically
  if (!(window as any).XLSX) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Impossible de charger SheetJS'));
      document.head.appendChild(script);
    });
  }
  const XLSX = (window as any).XLSX;
  const arrayBuffer = await file.arrayBuffer();
  const wb = XLSX.read(arrayBuffer);
  let text = '';
  wb.SheetNames.forEach((name: string) => {
    text += `--- ${name} ---\n`;
    text += XLSX.utils.sheet_to_csv(wb.Sheets[name]) + '\n';
  });
  return text.trim();
}

export async function extractTXT(file: File): Promise<string> {
  return await file.text();
}

export async function extractFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  if (name.endsWith('.pdf')) return extractPDF(file);
  if (name.endsWith('.docx') || name.endsWith('.doc')) return extractWord(file);
  if (name.endsWith('.xlsx') || name.endsWith('.xls')) return extractExcel(file);
  if (name.endsWith('.txt') || name.endsWith('.csv')) return extractTXT(file);
  throw new Error('Format de fichier non supporté');
}
