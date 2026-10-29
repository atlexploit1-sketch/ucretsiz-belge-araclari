"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import JSZip from "jszip";
import { FileText, Search, Check, ChevronRight, ShieldCheck, Zap, Globe2, Menu, X, ArrowUpRight, Image as ImageIcon, Files, Scissors, RotateCw, Minimize2, LockKeyhole, QrCode, Calculator, FileImage, FileSpreadsheet, BookOpen, Stamp, Hash, Crop, Sparkles, UploadCloud, Type, PenLine, ListOrdered, FilePenLine, ScanText, Layers, FileMinus, ArrowDownUp, FileOutput, FilePlus, Wrench, Info, Eraser, Barcode, Percent, CalendarDays, ImagePlus, FileType, Table, Presentation, Wifi, Instagram, MessageCircle, FileKey, CircleDollarSign, Ruler } from "lucide-react";

type ToolItem = { title: string; description: string; icon?: string };
type ToolGroup = { id: string; titleTR: string; titleEN: string; icon: typeof FileText; items: ToolItem[] };

const groups: ToolGroup[] = [
  { id: "edit", titleTR: "PDF Düzenle", titleEN: "Edit PDF", icon: FileText, items: [
    { title: "PDF'ye Metin Ekle", description: "PDF sayfalarına metin ekleyin." }, { title: "PDF İmzala", description: "Belgenizi elektronik olarak imzalayın." }, { title: "Sayfa Numarası Ekle", description: "Sayfaları otomatik olarak numaralandırın." }, { title: "Filigran Ekle", description: "PDF sayfalarına metin veya görsel filigran ekleyin." }, { title: "PDF Form Doldur", description: "PDF formlarını doldurun ve kaydedin." }, { title: "PDF OCR", description: "Taranmış belgelerdeki metni tanıyın." }, { title: "PDF'yi Gri Tonlamaya Çevir", description: "Belgenizi gri tonlamalı hale getirin." }, { title: "PDF Üst Üste Bindir", description: "Bir PDF'yi diğerinin üzerine yerleştirin." }
  ]},
  { id: "organize", titleTR: "PDF Düzenle ve Organize Et", titleEN: "Organize PDF", icon: Files, items: [
    { title: "PDF Birleştir", description: "Birden fazla PDF'yi tek belgede birleştirin." }, { title: "PDF Böl", description: "PDF'nizi ayrı dosyalara ayırın." }, { title: "PDF Sayfalarını Sil", description: "İstemediğiniz sayfaları kaldırın." }, { title: "PDF Sayfalarını Sırala", description: "Sayfaları istediğiniz sıraya getirin." }, { title: "PDF Döndür", description: "Sayfaların yönünü düzeltin." }, { title: "Sayfaları Çıkar", description: "Seçtiğiniz sayfaları ayrı bir PDF olarak alın." }, { title: "Boş Sayfa Ekle", description: "Belgenize yeni boş sayfalar ekleyin." }, { title: "PDF Kırp", description: "Sayfa kenar boşluklarını kırpın." }, { title: "PDF Kitapçık", description: "PDF'yi kitapçık düzenine hazırlayın." }
  ]},
  { id: "convert", titleTR: "PDF Dönüştür", titleEN: "Convert PDF", icon: FileImage, items: [
    { title: "PDF → Word", description: "PDF içeriğini Word belgesine aktarın." }, { title: "Word → PDF", description: "Word belgelerini PDF'ye dönüştürün." }, { title: "PDF → Excel", description: "Tabloları Excel'e aktarın." }, { title: "PDF → PowerPoint", description: "PDF sayfalarını sunum slaytlarına dönüştürün." }, { title: "PDF → JPG", description: "PDF sayfalarını JPG görsellerine dönüştürün." }, { title: "PDF → PNG", description: "Sayfaları PNG olarak dışa aktarın." }, { title: "JPG → PDF", description: "Fotoğrafları tek PDF dosyasında birleştirin." }, { title: "PNG → PDF", description: "PNG görsellerinden PDF oluşturun." }, { title: "PDF → EPUB", description: "PDF belgenizi e-kitap formatına dönüştürün." }, { title: "PDF → HTML", description: "PDF içeriğini web formatına aktarın." }
  ]},
  { id: "compress", titleTR: "PDF Optimize Et", titleEN: "Optimize PDF", icon: Minimize2, items: [
    { title: "PDF Sıkıştır", description: "PDF dosyasının boyutunu küçültün." }, { title: "PDF'yi 1 MB'a Sıkıştır", description: "Dosya boyutunu hedef boyuta indirmeyi deneyin." }, { title: "PDF'yi 500 KB'a Sıkıştır", description: "Daha küçük bir PDF elde edin." }, { title: "PDF Onar", description: "Açılmayan veya bozuk PDF dosyalarını kurtarmayı deneyin." }
  ]},
  { id: "security", titleTR: "PDF Güvenliği", titleEN: "PDF Security", icon: LockKeyhole, items: [
    { title: "PDF Şifrele", description: "PDF'nizi parola ile koruyun." }, { title: "PDF Şifre Kaldır", description: "Parolasını bildiğiniz PDF'nin korumasını kaldırın." }, { title: "PDF Metadata Temizle", description: "Belgedeki kişisel meta verileri temizleyin." }, { title: "PDF Metadata Görüntüle", description: "Belgenin teknik bilgilerini görüntüleyin." }, { title: "PDF Redact", description: "Hassas bilgileri kalıcı olarak gizleyin." }
  ]},
  { id: "images", titleTR: "Görsel Araçları", titleEN: "Image Tools", icon: ImageIcon, items: [
    { title: "JPG → PNG", description: "JPG görsellerini PNG'ye dönüştürün." }, { title: "PNG → JPG", description: "PNG görsellerini JPG'ye dönüştürün." }, { title: "WEBP → JPG", description: "WEBP görsellerini JPG'ye dönüştürün." }, { title: "JPG → WEBP", description: "JPG görsellerini WEBP'ye dönüştürün." }, { title: "Görsel Sıkıştır", description: "Görsel dosya boyutunu küçültün." }, { title: "Görsel Boyutlandır", description: "Görselleri istediğiniz ölçüye getirin." }, { title: "Görsel Kırp", description: "Görsellerin istediğiniz bölümünü kırpın." }, { title: "Görsel Döndür", description: "Görsellerin yönünü değiştirin." }, { title: "Görsele Filigran Ekle", description: "Görselin üzerine metin ekleyin." }, { title: "PDF Görsellerini Çıkar", description: "PDF içindeki görselleri dışa aktarın." }
  ]},
  { id: "qr", titleTR: "QR Kod ve Barkod", titleEN: "QR & Barcode", icon: QrCode, items: [
    { title: "QR Kod Oluştur", description: "Bağlantılar ve metinler için QR kod oluşturun." }, { title: "QR Kod Oku", description: "Bir görseldeki QR kodu okuyun." }, { title: "Wi-Fi QR Kod", description: "Wi-Fi ağına bağlanmak için QR oluşturun." }, { title: "WhatsApp QR Kod", description: "WhatsApp sohbet bağlantısı oluşturun." }, { title: "Instagram QR Kod", description: "Instagram profiliniz için QR kod oluşturun." }, { title: "Barkod Oluşturucu", description: "Ürünler için barkod oluşturun." }, { title: "Barkod Okuyucu", description: "Barkod görselindeki bilgiyi okuyun." }
  ]},
  { id: "ebook", titleTR: "E-Kitap Araçları", titleEN: "E-book Tools", icon: BookOpen, items: [
    { title: "EPUB → PDF", description: "EPUB e-kitabını PDF'ye dönüştürün." }, { title: "PDF → EPUB", description: "PDF'yi e-kitap formatına dönüştürün." }
  ]},
  { id: "calculators", titleTR: "Hesaplama Araçları", titleEN: "Calculators", icon: Calculator, items: [
    { title: "Yüzde Hesaplama", description: "Bir sayının yüzdesini hesaplayın." }, { title: "Yüzde Değişim", description: "İki değer arasındaki yüzde farkını bulun." }, { title: "KDV Hesaplama", description: "KDV dahil veya hariç tutarı hesaplayın." }, { title: "İndirim Hesaplama", description: "İndirimli fiyatı ve tasarrufu bulun." }, { title: "Kâr-Zarar Hesaplama", description: "Kâr veya zarar tutarını hesaplayın." }, { title: "Faiz Hesaplama", description: "Basit veya bileşik faizi hesaplayın." }, { title: "Kredi Taksit Hesaplama", description: "Tahmini aylık kredi taksitini hesaplayın." }, { title: "Yaş Hesaplama", description: "Doğum tarihinizden yaşınızı hesaplayın." }, { title: "İki Tarih Arası Gün", description: "İki tarih arasındaki süreyi bulun." }, { title: "Birim Dönüştürücü", description: "Yaygın ölçü birimlerini dönüştürün." }
  ]}
];

const popular = [groups[1].items[0], groups[1].items[1], groups[3].items[0], groups[2].items[0], groups[2].items[1], groups[0].items[2]];

function toolSlug(title: string) {
  return title.toLocaleLowerCase("tr-TR")
    .replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ı/g, "i")
    .replace(/ö/g, "o").replace(/ş/g, "s").replace(/ü/g, "u")
    .replace(/→/g, "-").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function Home() {
  const pathname = usePathname();
  const router = useRouter();
  const [language, setLanguage] = useState<"TR" | "EN">("TR");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<ToolItem | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [pageInput, setPageInput] = useState("1");
  const [pageNumberPosition, setPageNumberPosition] = useState<"left" | "center" | "right">("right");
  const [pageNumberColor, setPageNumberColor] = useState<"black" | "blue" | "red">("black");
  const [watermarkText, setWatermarkText] = useState("BELGE DOSTU");
  const [overlayFiles, setOverlayFiles] = useState<File[]>([]);
  const [toolText, setToolText] = useState("Metniniz");
  const [signatureText, setSignatureText] = useState("");
  const [formFields, setFormFields] = useState<Array<{name:string; value:string; type:string}>>([]);
  const [toolMessage, setToolMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [compressionLevel, setCompressionLevel] = useState<"low" | "medium" | "high">("medium");
  const docxRenderRef = useRef<HTMLDivElement | null>(null);
  const pdfPreviewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [previewPage, setPreviewPage] = useState(1);
  const [previewPageCount, setPreviewPageCount] = useState(0);
  const [textSize, setTextSize] = useState(18);
  const [textColor, setTextColor] = useState("#111827");
  const [textPlacements, setTextPlacements] = useState<Array<{ id: string; page: number; x: number; y: number; text: string; size: number; color: string }>>([]);
  useEffect(() => {
    let cancelled = false;
    const renderPreview = async () => {
      const title = selected?.title.toLocaleLowerCase("tr-TR") ?? "";
      const file = selectedFiles[0];
      const canvas = pdfPreviewCanvasRef.current;
      if (!title.includes("metin ekle") || !file || !canvas) return;
      try {
        const pdfjs: any = await import("pdfjs-dist/legacy/build/pdf.mjs");
        if (pdfjs.GlobalWorkerOptions && !pdfjs.GlobalWorkerOptions.workerSrc) {
          pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
        }
        const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
        if (cancelled) return;
        setPreviewPageCount(pdf.numPages);
        const pageNo = Math.min(Math.max(1, previewPage), pdf.numPages);
        const page = await pdf.getPage(pageNo);
        const viewport = page.getViewport({ scale: 1.35 });
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Önizleme alanı açılamadı.");
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        canvas.style.width = "100%";
        canvas.style.height = "auto";
        await page.render({ canvasContext: ctx, viewport }).promise;
      } catch (err) {
        if (!cancelled) setToolMessage("PDF önizlemesi açılamadı. PDF dosyasının bozuk veya şifreli olmadığını kontrol edin.");
      }
    };
    void renderPreview();
    return () => { cancelled = true; };
  }, [selected, selectedFiles, previewPage]);

  const isTR = language === "TR";
  const allItems = useMemo(() => groups.flatMap(g => g.items.map(item => ({ ...item, groupId: g.id, groupTitle: isTR ? g.titleTR : g.titleEN }))), [isTR]);
  const results = allItems.filter(item => `${item.title} ${item.description} ${item.groupTitle}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  const relatedItems = useMemo(() => {
    if (!selected) return [];
    const current = allItems.find(item => item.title === selected.title);
    const candidates = allItems.filter(item => item.title !== selected.title);
    const score = (title: string) => {
      const source = `${selected.title}|${title}`;
      let value = 2166136261;
      for (let i = 0; i < source.length; i++) value = Math.imul(value ^ source.charCodeAt(i), 16777619);
      return value >>> 0;
    };
    const sameGroup = candidates.filter(item => current && item.groupId === current.groupId).sort((a, b) => score(a.title) - score(b.title));
    const otherGroups = candidates.filter(item => !current || item.groupId !== current.groupId).sort((a, b) => score(a.title) - score(b.title));
    return [...sameGroup, ...otherGroups].slice(0, 4);
  }, [selected, allItems]);
  useEffect(() => {
    const parts = pathname.split("/").filter(Boolean);
    const slug = parts.length >= 2 && parts[0] === "tr" ? parts[parts.length - 1] : "";
    if (!slug) {
      if (selected) setSelected(null);
      return;
    }
    const match = allItems.find(item => toolSlug(item.title) === slug);
    if (match && selected?.title !== match.title) {
      setSelected({ title: match.title, description: match.description });
      setSelectedFiles([]); setToolMessage(""); setTextPlacements([]); setPreviewPage(1); setPreviewPageCount(0);
    }
  }, [pathname, allItems]);
  const openTool = (tool: ToolItem) => { setSelected(tool); router.push(`/tr/${toolSlug(tool.title)}`); setSelectedFiles([]); setPageInput("1"); setPageNumberPosition("right"); setPageNumberColor("black"); setWatermarkText("BELGE DOSTU"); setOverlayFiles([]); setToolText(""); setSignatureText(""); setFormFields([]); setCompressionLevel("medium"); setToolMessage(""); setPreviewPage(1); setPreviewPageCount(0); setTextPlacements([]); setTextSize(18); setTextColor("#111827"); };
  const closeTool = () => { setSelected(null); router.push("/"); setSelectedFiles([]); setOverlayFiles([]); setFormFields([]); setToolMessage(""); setTextPlacements([]); setPreviewPage(1); setPreviewPageCount(0); };
  const downloadBytes = (bytes: Uint8Array, filename: string, type = "application/pdf") => {
    const blob = new Blob([bytes as BlobPart], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
  };
  const runSelectedTool = async () => {
    if (!selected) return;
    setIsProcessing(true); setToolMessage("");
    try {
      const name = selected.title.toLocaleLowerCase("tr-TR");
      if (!selectedFiles.length) throw new Error("Önce dosya seç.");
      if (name.includes("word → pdf") || name.includes("word to pdf")) {
        const docx = selectedFiles[0];
        if (!docx.name.toLowerCase().endsWith(".docx")) throw new Error("Lütfen .docx biçiminde bir Word dosyası seç.");
        if (!docxRenderRef.current) throw new Error("Dönüştürme alanı hazırlanamadı. Sayfayı yenileyip tekrar deneyin.");

        // DOCX-Preview ile Word sayfasını kendi sayfa ölçüleri ve stilleriyle oluştur.
        // Belgenin içindeki font/karakter aralıklarını topluca ezmek, bazı DOCX dosyalarında
        // harflerin ve satırların birbirinden kopmasına neden olabiliyor; bu yüzden stilleri koruyoruz.
        const [{ renderAsync }, html2canvasModule, jspdfModule] = await Promise.all([
          import("docx-preview"),
          import("html2canvas"),
          import("jspdf"),
        ]);
        const html2canvas = html2canvasModule.default;
        const { jsPDF } = jspdfModule;
        const renderRoot = docxRenderRef.current;
        renderRoot.innerHTML = "";
        renderRoot.style.position = "fixed";
        renderRoot.style.left = "0";
        renderRoot.style.top = "0";
        renderRoot.style.width = "794px";
        renderRoot.style.height = "auto";
        renderRoot.style.opacity = "0";
        renderRoot.style.overflow = "visible";
        renderRoot.style.zIndex = "-1";

        await renderAsync(await docx.arrayBuffer(), renderRoot, undefined, {
          className: "docx",
          inWrapper: true,
          ignoreWidth: false,
          ignoreHeight: false,
          ignoreFonts: false,
          breakPages: true,
          useBase64URL: true,
          renderHeaders: true,
          renderFooters: true,
          renderFootnotes: true,
        });

        if (document.fonts?.ready) await document.fonts.ready;
        await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
        const pages = Array.from(renderRoot.querySelectorAll<HTMLElement>("section.docx"));
        if (!pages.length) throw new Error("Word belgesinin sayfaları oluşturulamadı. DOCX dosyasını Word'de açıp yeniden kaydedin.");

        // A4 genişliğini sabitle ama sayfa yüksekliğini KESME.
        // Bazı DOCX dosyaları docx-preview tarafından tek uzun bölüm olarak çiziliyor;
        // içeriği 1 A4 yüksekliğinde dilimlere bölerek tüm sayfaları PDF'ye ekle.
        const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
        const targetWidth = 794;
        const targetHeight = 1123;
        const sliceHeight = targetHeight * 2; // html2canvas scale=2
        // Her PDF sayfasında yaklaşık 10 mm üst/alt beyaz kenar boşluğu bırak.
        const verticalMarginPx = 76;
        const contentSliceHeight = sliceHeight - verticalMarginPx * 2;
        let pdfPageAdded = false;

        for (const page of pages) {
          page.style.width = `${targetWidth}px`;
          page.style.minWidth = `${targetWidth}px`;
          page.style.maxWidth = `${targetWidth}px`;
          page.style.height = "auto";
          page.style.minHeight = "0";
          page.style.maxHeight = "none";
          page.style.boxSizing = "border-box";
          page.style.margin = "0";
          page.style.overflow = "visible";
          page.style.transform = "none";

          const fullHeight = Math.max(page.scrollHeight, page.offsetHeight, targetHeight);
          const canvas = await html2canvas(page, {
            scale: 2,
            useCORS: true,
            allowTaint: false,
            backgroundColor: "#ffffff",
            logging: false,
            width: targetWidth,
            height: fullHeight,
            windowWidth: targetWidth,
            windowHeight: fullHeight,
            scrollX: 0,
            scrollY: 0,
          });

          // Uzun içeriği A4 sayfalarına bölerken satırın ortasından kesmemek için
          // hedef kesim noktasının yakınında tamamen boş (beyaz) bir yatay çizgi ara.
          const cutPoints: number[] = [];
          let cursorY = 0;
          while (canvas.height - cursorY > contentSliceHeight) {
            const idealY = cursorY + contentSliceHeight;
            const ctxScan = canvas.getContext("2d", { willReadFrequently: true });
            if (!ctxScan) throw new Error("Sayfa sınırları analiz edilemedi.");
            const scanRadius = 100;
            const fromY = Math.max(cursorY + Math.floor(contentSliceHeight * 0.82), idealY - scanRadius);
            const toY = Math.min(canvas.height - 1, idealY + scanRadius);
            const scan = ctxScan.getImageData(0, fromY, canvas.width, toY - fromY + 1);
            let bestY = idealY;
            let bestScore = Number.POSITIVE_INFINITY;
            for (let row = 0; row < scan.height; row++) {
              let darkPixels = 0;
              const rowStart = row * scan.width * 4;
              // Sample every second pixel for speed; count visibly non-white pixels.
              for (let x = 0; x < scan.width; x += 2) {
                const k = rowStart + x * 4;
                if (scan.data[k] < 220 || scan.data[k + 1] < 220 || scan.data[k + 2] < 220) darkPixels++;
              }
              const y = fromY + row;
              const distancePenalty = Math.abs(y - idealY) * 0.35;
              const score = darkPixels + distancePenalty;
              if (score < bestScore) {
                bestScore = score;
                bestY = y;
              }
            }
            // Leave a little extra whitespace after the last text row.
            const nextY = Math.max(cursorY + 1, Math.min(canvas.height, bestY));
            cutPoints.push(nextY);
            cursorY = nextY;
          }
          cutPoints.push(canvas.height);
          let sourceY = 0;
          for (const endY of cutPoints) {
            const currentSliceHeight = endY - sourceY;
            if (currentSliceHeight <= 0) continue;
            const pageCanvas = document.createElement("canvas");
            pageCanvas.width = canvas.width;
            pageCanvas.height = sliceHeight;
            const ctx = pageCanvas.getContext("2d");
            if (!ctx) throw new Error("PDF sayfası hazırlanamadı. Lütfen tekrar deneyin.");
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
            // İçeriği dikeyde ortalamadan, üstte ve altta sabit beyaz kenar boşluğuyla yerleştir.
            ctx.drawImage(canvas, 0, sourceY, canvas.width, currentSliceHeight, 0, verticalMarginPx, pageCanvas.width, currentSliceHeight);

            if (pdfPageAdded) pdf.addPage("a4", "portrait");
            const image = pageCanvas.toDataURL("image/jpeg", 0.94);
            pdf.addImage(image, "JPEG", 0, 0, 210, 297, undefined, "FAST");
            pdfPageAdded = true;
            pageCanvas.width = 1;
            pageCanvas.height = 1;
            sourceY = endY;
          }
          canvas.width = 1;
          canvas.height = 1;
        }
        pdf.save(`${docx.name.replace(/\\.docx$/i, "")}.pdf`);
        renderRoot.innerHTML = "";
      } else if (name.includes("pdf → word") || name.includes("pdf to word")) {
        if (!selectedFiles[0].name.toLowerCase().endsWith(".pdf")) throw new Error("Lütfen PDF dosyası seç.");
        const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
        pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
        const data = new Uint8Array(await selectedFiles[0].arrayBuffer());
        const pdfDoc = await pdfjs.getDocument({ data, useWorkerFetch: false, isEvalSupported: false }).promise;
        const paragraphs: string[] = [];
        for (let p = 1; p <= pdfDoc.numPages; p++) {
          const page = await pdfDoc.getPage(p);
          const content = await page.getTextContent();
          const items = (content.items as Array<{ str?: string; transform?: number[]; width?: number; hasEOL?: boolean }>)
            .filter(item => Boolean(item.str?.trim()) && Array.isArray(item.transform))
            .map(item => ({ text: item.str || "", x: item.transform![4], y: item.transform![5], width: item.width || 0, hasEOL: Boolean(item.hasEOL) }))
            .sort((a, b) => Math.abs(b.y - a.y) > 2.5 ? b.y - a.y : a.x - b.x);

          // Group text fragments by their visual baseline and preserve the actual
          // horizontal gaps instead of inserting a space between every PDF fragment.
          const lines: Array<Array<{ text: string; x: number; y: number; width: number; hasEOL: boolean }>> = [];
          for (const item of items) {
            let line = lines.find(candidate => Math.abs(candidate[0].y - item.y) <= 2.5);
            if (!line) { line = []; lines.push(line); }
            line.push(item);
          }
          lines.sort((a, b) => b[0].y - a[0].y);
          for (const line of lines) {
            line.sort((a, b) => a.x - b.x);
            let text = "";
            let previousRight: number | undefined;
            for (const item of line) {
              const gap = previousRight === undefined ? 0 : item.x - previousRight;
              // A visible gap larger than a small fraction of a typical character
              // width indicates a word boundary. Avoid adding spaces inside split words.
              if (text && gap > 2.2 && !/\s$/.test(text) && !/^\s/.test(item.text)) text += " ";
              text += item.text;
              previousRight = item.x + item.width;
            }
            const cleaned = text.replace(/[ \t]+/g, " ").trim();
            if (cleaned) paragraphs.push(cleaned);
          }
          if (p < pdfDoc.numPages) paragraphs.push("");
        }
        const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
        const body = paragraphs.map(t => t
          ? `<w:p><w:pPr><w:spacing w:before="0" w:after="0" w:line="240" w:lineRule="auto"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:eastAsia="Times New Roman" w:cs="Times New Roman"/><w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr><w:t xml:space="preserve">${esc(t)}</w:t></w:r></w:p>`
          : `<w:p><w:pPr><w:spacing w:before="0" w:after="0" w:line="240" w:lineRule="auto"/></w:pPr></w:p>`
        ).join("");
        const docXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body}<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="720" w:right="900" w:bottom="720" w:left="900"/></w:sectPr></w:body></w:document>`;
        const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:eastAsia="Times New Roman" w:cs="Times New Roman"/><w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:before="0" w:after="0" w:line="240" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:eastAsia="Times New Roman" w:cs="Times New Roman"/><w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr></w:style></w:styles>`;
        const docx = new JSZip();
        docx.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>`);
        docx.folder("_rels")!.file(".rels", `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`);
        docx.folder("word")!.file("document.xml", docXml);
        docx.folder("word")!.file("styles.xml", stylesXml);
        docx.folder("word")!.folder("_rels")!.file("document.xml.rels", `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`);
        downloadBytes(await docx.generateAsync({ type: "uint8array" }), "pdf-metni.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
      } else if (name.includes("pdf ocr")) {
        if (!selectedFiles[0].name.toLowerCase().endsWith(".pdf")) throw new Error("Lütfen PDF dosyası seç.");
        const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
        pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
        const doc = await pdfjs.getDocument({data:new Uint8Array(await selectedFiles[0].arrayBuffer()), useWorkerFetch:false, isEvalSupported:false}).promise;
        const chunks: string[] = [];
        // First try embedded text, then OCR rendered page images when text is absent.
        for (let i=1;i<=doc.numPages;i++) { const page=await doc.getPage(i); const content=await page.getTextContent(); const text=(content.items as Array<{str?:string}>).map(x=>x.str||"").join(" ").trim(); if(text) { chunks.push(`--- Sayfa ${i} ---\n${text}`); continue; }
          const viewport=page.getViewport({scale:1.6}); const canvas=document.createElement("canvas"); canvas.width=Math.ceil(viewport.width); canvas.height=Math.ceil(viewport.height); const ctx=canvas.getContext("2d"); if(!ctx) throw new Error("OCR için tuval oluşturulamadı."); await page.render({canvasContext:ctx, canvas, viewport} as never).promise;
          const T:any=await new Promise((resolve,reject)=>{ const old=(window as any).Tesseract; if(old) return resolve(old); const script=document.createElement("script"); script.src="https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js"; script.onload=()=>resolve((window as any).Tesseract); script.onerror=()=>reject(new Error("OCR motoru yüklenemedi. İnternet bağlantını kontrol et.")); document.head.appendChild(script); });
          const worker=await T.createWorker("tur+eng"); const result=await worker.recognize(canvas); chunks.push(`--- Sayfa ${i} ---\n${result.data.text}`); await worker.terminate();
        }
        const text=chunks.join("\n\n"); const blob=new Blob([text],{type:"text/plain;charset=utf-8"}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download="ocr-metni.txt"; a.click(); URL.revokeObjectURL(url); setToolMessage("Metin çıkarıldı ve TXT dosyası indirildi. Taranmış sayfalarda OCR için internet gerekir.");
      } else if (name.includes("pdf'ye metin ekle") || name.includes("pdf'ye metin")) {
        if (!textPlacements.length) throw new Error("Önce PDF önizlemesinde metni eklemek istediğiniz yere tıklayın.");
        const pdf = await PDFDocument.load(await selectedFiles[0].arrayBuffer());
        const font = await pdf.embedFont(StandardFonts.Helvetica);
        for (const item of textPlacements) {
          const page = pdf.getPages()[item.page - 1];
          if (!page || !item.text.trim()) continue;
          const { width, height } = page.getSize();
          const safe = item.text.replace(/[ÇçĞğİıÖöŞşÜü]/g, ch => ({"Ç":"C","ç":"c","Ğ":"G","ğ":"g","İ":"I","ı":"i","Ö":"O","ö":"o","Ş":"S","ş":"s","Ü":"U","ü":"u"}[ch] || ch));
          page.drawText(safe, { x: Math.max(0, Math.min(width - 10, item.x * width)), y: Math.max(0, Math.min(height - item.size, height * (1 - item.y))), size: item.size, font, color: rgb(parseInt(item.color.slice(1,3),16)/255, parseInt(item.color.slice(3,5),16)/255, parseInt(item.color.slice(5,7),16)/255), maxWidth: Math.max(20, width * (1 - item.x) - 8) });
        }
        downloadBytes(await pdf.save(), "metin-eklenmis.pdf");
      } else if (name.includes("pdf imzala")) {
        const pdf=await PDFDocument.load(await selectedFiles[0].arrayBuffer()); const font=await pdf.embedFont(StandardFonts.HelveticaOblique); const safe=(signatureText.trim()||"Imzalandi").replace(/[ÇçĞğİıÖöŞşÜü]/g,ch=>({"Ç":"C","ç":"c","Ğ":"G","ğ":"g","İ":"I","ı":"i","Ö":"O","ö":"o","Ş":"S","ş":"s","Ü":"U","ü":"u"}[ch]||ch)); const page=pdf.getPages()[0]; page.drawText(safe,{x:page.getWidth()-210,y:55,size:22,font,color:rgb(.08,.2,.65)}); page.drawLine({start:{x:page.getWidth()-220,y:49},end:{x:page.getWidth()-45,y:49},thickness:1,color:rgb(.08,.2,.65)}); downloadBytes(await pdf.save(),"imzalanmis.pdf");
      } else if (name.includes("form doldur")) {
        const pdf=await PDFDocument.load(await selectedFiles[0].arrayBuffer()); const form=pdf.getForm(); let filled=0;
        for(const f of formFields){ try { const field=form.getField(f.name); if(f.type==="PDFTextField") { (field as any).setText(f.value); filled++; } else if(f.type==="PDFCheckBox") { if(["1","true","evet","yes","x"].includes(f.value.trim().toLowerCase())) (field as any).check(); else (field as any).uncheck(); filled++; } else if(f.type==="PDFDropdown" || f.type==="PDFOptionList") { if(f.value) (field as any).select(f.value); filled++; } } catch {} }
        if(!form.getFields().length) throw new Error("Bu PDF'de doldurulabilir form alanı bulunamadı. Form alanları içeren bir PDF seç.");
        form.flatten(); downloadBytes(await pdf.save(),"form-doldurulmus.pdf"); setToolMessage(`${filled} form alanı işlendi. Form alanı adlarını dosya seçince listelenen alanlara göre doldur.`);
      } else if (name.includes("gri tonlamaya")) {
        const pdfjs=await import("pdfjs-dist/legacy/build/pdf.mjs"); pdfjs.GlobalWorkerOptions.workerSrc=`https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`; const src=await pdfjs.getDocument({data:new Uint8Array(await selectedFiles[0].arrayBuffer()),useWorkerFetch:false,isEvalSupported:false}).promise; const out=await PDFDocument.create();
        for(let i=1;i<=src.numPages;i++){const pg=await src.getPage(i);const vp=pg.getViewport({scale:1.5});const canvas=document.createElement("canvas");canvas.width=Math.ceil(vp.width);canvas.height=Math.ceil(vp.height);const ctx=canvas.getContext("2d");if(!ctx)throw new Error("Tuval oluşturulamadı.");await pg.render({canvasContext:ctx,canvas,viewport:vp} as never).promise;const image=ctx.getImageData(0,0,canvas.width,canvas.height);for(let k=0;k<image.data.length;k+=4){const g=Math.round(.299*image.data[k]+.587*image.data[k+1]+.114*image.data[k+2]);image.data[k]=image.data[k+1]=image.data[k+2]=g;}ctx.putImageData(image,0,0);const bytes=await new Promise<Uint8Array>((resolve,reject)=>canvas.toBlob(b=>b?b.arrayBuffer().then(ab=>resolve(new Uint8Array(ab))):reject(new Error("Sayfa görüntüsü oluşturulamadı.")),"image/png")).then(b=>b);const embedded=await out.embedPng(bytes);const outPage=out.addPage([pg.view[2]-pg.view[0],pg.view[3]-pg.view[1]]);outPage.drawImage(embedded,{x:0,y:0,width:outPage.getWidth(),height:outPage.getHeight()});}
        downloadBytes(await out.save(),"gri-tonlamali.pdf"); setToolMessage("PDF gri tonlamaya dönüştürüldü. Sayfalar görüntü tabanlı olduğu için dosya büyüyebilir.");
      } else if (name.includes("üst üste bindir")) {
        if(selectedFiles.length<1 || overlayFiles.length<1) throw new Error("Ana PDF ve üstüne bindirilecek ikinci PDF dosyasını seç."); const base=await PDFDocument.load(await selectedFiles[0].arrayBuffer()); const overlay=await PDFDocument.load(await overlayFiles[0].arrayBuffer()); const copies=await base.embedPages(overlay.getPages()); const pages=base.getPages(); pages.forEach((page,i)=>{const ov=copies[i%copies.length];const {width,height}=page.getSize();page.drawPage(ov,{x:0,y:0,width,height,opacity:.35});});downloadBytes(await base.save(),"ust-uste-bindirilmis.pdf");
      } else if (name.includes("birleştir")) {
        if (selectedFiles.length < 2) throw new Error("Birleştirmek için en az iki PDF seç.");
        const out = await PDFDocument.create();
        for (const file of selectedFiles) { const src = await PDFDocument.load(await file.arrayBuffer()); const pages = await out.copyPages(src, src.getPageIndices()); pages.forEach(page => out.addPage(page)); }
        downloadBytes(await out.save({ useObjectStreams: true }), "birlesmis-belge.pdf");
      } else if (name.includes("sıkıştır") || name.includes("compress")) {
        if (!selectedFiles[0].name.toLowerCase().endsWith(".pdf")) throw new Error("Lütfen bir PDF dosyası seç.");
        const originalBytes = new Uint8Array(await selectedFiles[0].arrayBuffer());
        // Keep the original size before PDF.js potentially transfers/detaches its buffer.
        const originalSizeBytes = originalBytes.byteLength;
        const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
        pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
        const source = await pdfjs.getDocument({ data: originalBytes.slice(), useWorkerFetch: false, isEvalSupported: false }).promise;
        const settings = compressionLevel === "low"
          ? { scale: 1.7, quality: 0.86 }
          : compressionLevel === "high"
            ? { scale: 1.0, quality: 0.48 }
            : { scale: 1.35, quality: 0.68 };
        const out = await PDFDocument.create();
        for (let i = 1; i <= source.numPages; i++) {
          const sourcePage = await source.getPage(i);
          const viewport = sourcePage.getViewport({ scale: settings.scale });
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.ceil(viewport.width));
          canvas.height = Math.max(1, Math.ceil(viewport.height));
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("PDF sayfası görüntülenemedi.");
          await sourcePage.render({ canvasContext: ctx, canvas, viewport } as never).promise;
          const jpegBytes = await new Promise<Uint8Array>((resolve, reject) => {
            canvas.toBlob(blob => {
              if (!blob) { reject(new Error("Sıkıştırılmış sayfa oluşturulamadı.")); return; }
              blob.arrayBuffer().then(buffer => resolve(new Uint8Array(buffer))).catch(reject);
            }, "image/jpeg", settings.quality);
          });
          const image = await out.embedJpg(jpegBytes);
          const pageSize = sourcePage.getViewport({ scale: 1 });
          const outPage = out.addPage([pageSize.width, pageSize.height]);
          outPage.drawImage(image, { x: 0, y: 0, width: pageSize.width, height: pageSize.height });
          canvas.width = 1; canvas.height = 1;
        }
        const compressedBytes = await out.save({ useObjectStreams: true });
        downloadBytes(compressedBytes, "sikistirilmis-belge.pdf");
        // Keep the completion notice identical for all compression levels.
        setToolMessage("Tamamlandı\n\nBu işlem tamamen tarayıcınızda gerçekleşir, dosyanız sunucuya gönderilmez.");
      } else if (name.includes("görsel") && name.includes("pdf") || name.includes("jpg → pdf") || name.includes("png → pdf")) {
        const out = await PDFDocument.create();
        for (const file of selectedFiles) { const bytes = new Uint8Array(await file.arrayBuffer()); const img = file.type.includes("png") ? await out.embedPng(bytes) : await out.embedJpg(bytes); const page = out.addPage([img.width, img.height]); page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height }); }
        downloadBytes(await out.save(), "gorsellerden-belge.pdf");
      } else {
        const file = selectedFiles[0]; const pdf = await PDFDocument.load(await file.arrayBuffer());
        if (name.includes("döndür")) { pdf.getPages().forEach(page => page.setRotation(degrees((page.getRotation().angle + 90) % 360))); downloadBytes(await pdf.save(), "dondurulmus-belge.pdf"); }
        else if (name.includes("sayfalarını sil") || name.includes("sayfa sil")) { const indexes = pageInput.split(",").map(v => Number(v.trim()) - 1).filter(v => Number.isInteger(v) && v >= 0 && v < pdf.getPageCount()); if (!indexes.length) throw new Error("Silinecek sayfa numaralarını 1'den başlayarak gir. Örnek: 2,4"); [...indexes].sort((a,b)=>b-a).forEach(i => pdf.removePage(i)); downloadBytes(await pdf.save(), "sayfalari-silinmis.pdf"); }
        else if (name.includes("çıkar") || name.includes("böl") || name.includes("extract")) {
          const totalPages = pdf.getPageCount();
          const input = pageInput.trim().replace(/[–—−]/g, "-");
          if (!input) throw new Error("Alınacak sayfa numaralarını gir. Örnek: 1-5 veya 1,3,5");
          const selectedIndexes: number[] = [];
          for (const partRaw of input.split(",")) {
            const part = partRaw.trim();
            if (!part) throw new Error("Sayfa aralığı geçersiz. Örnek: 1-5, 7, 9-11");
            const range = part.match(/^(\d+)\s*-\s*(\d+)$/);
            if (range) {
              const start = Number(range[1]);
              const end = Number(range[2]);
              if (start < 1 || end < 1 || start > end || end > totalPages) {
                throw new Error(`Geçersiz aralık: ${part}. Bu PDF ${totalPages} sayfa içeriyor.`);
              }
              for (let pageNo = start; pageNo <= end; pageNo++) selectedIndexes.push(pageNo - 1);
            } else if (/^\d+$/.test(part)) {
              const pageNo = Number(part);
              if (pageNo < 1 || pageNo > totalPages) {
                throw new Error(`Geçersiz sayfa: ${pageNo}. Bu PDF ${totalPages} sayfa içeriyor.`);
              }
              selectedIndexes.push(pageNo - 1);
            } else {
              throw new Error(`Geçersiz ifade: "${part}". Örnek: 1-5, 7, 9-11`);
            }
          }
          const indexes = [...new Set(selectedIndexes)];
          if (!indexes.length) throw new Error("Alınacak sayfa numaralarını gir.");
          const out = await PDFDocument.create();
          const pages = await out.copyPages(pdf, indexes);
          pages.forEach(page => out.addPage(page));
          downloadBytes(await out.save(), "secili-sayfalar.pdf");
        }
        else if (name.includes("boş sayfa")) { pdf.addPage(); downloadBytes(await pdf.save(), "bos-sayfa-eklendi.pdf"); }
        else if (name.includes("sayfa numarası") || name.includes("numarası ekle")) { const font = await pdf.embedFont(StandardFonts.TimesRoman); const size = 10; pdf.getPages().forEach((page, i) => { const { width } = page.getSize(); const label = String(i + 1); const textWidth = font.widthOfTextAtSize(label, size); const margin = 30; const x = pageNumberPosition === "left" ? margin : pageNumberPosition === "center" ? (width - textWidth) / 2 : width - margin - textWidth; const numberColor = pageNumberColor === "blue" ? rgb(0.12, 0.32, 0.95) : pageNumberColor === "red" ? rgb(0.88, 0.12, 0.16) : rgb(0, 0, 0); page.drawText(label, { x, y: 18, size, font, color: numberColor }); }); downloadBytes(await pdf.save(), "sayfa-numarali.pdf"); }
        else if (name.includes("filigran")) { const font = await pdf.embedFont(StandardFonts.HelveticaBold); pdf.getPages().forEach(page => { const { width, height } = page.getSize(); const safeWatermark=(watermarkText || "BELGE DOSTU").replace(/[ÇçĞğİıÖöŞşÜü]/g,ch=>({"Ç":"C","ç":"c","Ğ":"G","ğ":"g","İ":"I","ı":"i","Ö":"O","ö":"o","Ş":"S","ş":"s","Ü":"U","ü":"u"}[ch]||ch)); page.drawText(safeWatermark, { x: width * .2, y: height * .5, size: 28, font, color: rgb(.65,.68,.75), opacity: .35, rotate: degrees(-30) }); }); downloadBytes(await pdf.save(), "filigranli.pdf"); }
        else throw new Error("Bu aracın işlem motoru henüz eklenmedi.");
      }
      if (!toolMessage) setToolMessage("İşlem tamamlandı! Dosyan indirilmeye hazır.");
    } catch (err) { setToolMessage(err instanceof Error ? err.message : "İşlem sırasında bir hata oluştu."); } finally { setIsProcessing(false); }
  };

  return <main id="top">
    {!selected && <>
    <header className="topbar">
      <a className="brand" href="#top" aria-label="Belge Dostu ana sayfa"><span className="brand-icon"><FileText size={25}/></span><span className="brand-copy"><strong>BELGE <em>DOSTU</em></strong><small>{isTR ? "Ücretsiz çevrimiçi araçlar" : "Free online tools"}</small></span></a>
      <button className="mobile-menu-button" onClick={() => setMobileMenu(v => !v)} aria-label="Menüyü aç/kapat">{mobileMenu ? <X size={22}/> : <Menu size={22}/>}</button>
      <nav className={`nav-links ${mobileMenu ? "is-open" : ""}`}>
        <a href="#pdf-tools" onClick={() => setMobileMenu(false)}>{isTR ? "PDF Araçları" : "PDF Tools"}</a><a href="#convert" onClick={() => setMobileMenu(false)}>{isTR ? "Dönüştür" : "Convert"}</a><a href="#images" onClick={() => setMobileMenu(false)}>{isTR ? "Görsel Araçları" : "Image Tools"}</a><a href="#qr" onClick={() => setMobileMenu(false)}>{isTR ? "QR Kod" : "QR Code"}</a><a href="#calculators" onClick={() => setMobileMenu(false)}>{isTR ? "Hesaplamalar" : "Calculators"}</a>
      </nav>
      <div className="language-switch"><button className={isTR ? "selected" : ""} onClick={() => setLanguage("TR")}>TR</button><button className={!isTR ? "selected" : ""} onClick={() => setLanguage("EN")}>EN</button></div>
    </header>

    <section className="hero-centered">
      <div className="hero-glow hero-glow-one"/><div className="hero-glow hero-glow-two"/>
      <div className="hero-inner"><div className="hero-kicker"><Sparkles size={15}/>{isTR ? "DOSYALARIN İÇİN TEK MERKEZ" : "ONE PLACE FOR YOUR FILES"}</div>
        <h1>{isTR ? <>Dosyalarınızla ilgili<br/><span>her şey tek yerde.</span></> : <>Everything for your files<br/><span>in one place.</span></>}</h1>
        <p>{isTR ? "PDF'leri düzenleyin, dönüştürün, sıkıştırın ve daha fazlasını yapın. Ücretsiz, hızlı ve kolay." : "Edit, convert, compress PDFs and do much more. Free, fast and easy."}</p>
        <label className="tool-search"><Search size={21}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder={isTR ? "Hangi araca ihtiyacınız var? Örn. PDF birleştir" : "What do you need? e.g. Merge PDF"}/>{query && <button type="button" onClick={() => setQuery("")} aria-label="Aramayı temizle"><X size={17}/></button>}</label>
        <div className="trust-pills"><span><Check size={16}/>{isTR ? "Ücretsiz" : "Free"}</span><span><ShieldCheck size={16}/>{isTR ? "Güvenli işlem" : "Secure processing"}</span><span><Zap size={16}/>{isTR ? "Hızlı ve kolay" : "Fast & easy"}</span></div>
      </div>
    </section>

    {query ? <section className="catalog-section" id="search-results"><div className="section-heading"><div><span className="eyebrow">{isTR ? "ARAMA SONUÇLARI" : "SEARCH RESULTS"}</span><h2>{isTR ? `“${query}” için sonuçlar` : `Results for “${query}”`}</h2><p>{results.length} {isTR ? "araç bulundu" : "tools found"}</p></div></div><div className="tool-grid">{results.map((item,i)=><ToolCard key={`${item.title}-${i}`} item={item} onClick={openTool}/>)}</div></section> : <>
      <section className="catalog-section popular-section" id="pdf-tools"><div className="section-heading"><div><span className="eyebrow">{isTR ? "EN ÇOK KULLANILANLAR" : "MOST USED"}</span><h2>{isTR ? "Popüler Araçlar" : "Popular Tools"}</h2><p>{isTR ? "Günlük işleriniz için en çok tercih edilen araçlar." : "The most popular tools for everyday tasks."}</p></div><a className="text-link" href="#all-tools">{isTR ? "Tüm araçlar" : "All tools"}<ArrowUpRight size={17}/></a></div><div className="tool-grid popular-grid">{popular.map((item,i)=><ToolCard key={item.title} item={item} onClick={openTool} popular={i<3}/>)}</div></section>
      <section className="catalog-section" id="all-tools"><div className="section-heading"><div><span className="eyebrow">{isTR ? "TÜM ARAÇLAR" : "ALL TOOLS"}</span><h2>{isTR ? "İhtiyacınız olan aracı bulun" : "Find the tool you need"}</h2><p>{isTR ? "Kategorilere göz atın ve işleminizi birkaç adımda başlatın." : "Browse categories and get started in a few steps."}</p></div></div></section>
      {groups.map(group=>{const Icon=group.icon;return <section className="catalog-section category-section" id={group.id} key={group.id}><div className="section-heading category-heading"><div className="category-title-icon"><Icon size={22}/></div><div><h2>{isTR?group.titleTR:group.titleEN}</h2><p>{group.items.length} {isTR?"araç":"tools"}</p></div><a className="text-link" href="#top">{isTR?"Yukarı çık":"Back to top"}<ArrowUpRight size={16}/></a></div><div className="tool-grid">{group.items.map(item=><ToolCard key={item.title} item={item} onClick={openTool}/>)}</div></section>})}
    </>}

    <section className="privacy-banner"><div className="privacy-icon"><ShieldCheck size={27}/></div><div><h2>{isTR ? "Dosyalarınız sizin kontrolünüzde." : "Your files stay in your control."}</h2><p>{isTR ? "Gizliliğinizi önemsiyoruz. Araçların işlem davranışı, her araç geliştirildikçe açıkça belirtilecektir." : "We care about your privacy. Each tool's processing behavior will be clearly described as it is implemented."}</p></div></section>
    <footer><a className="footer-brand" href="#top"><FileText size={22}/> BELGE DOSTU</a><p>{isTR ? "Belgeleriniz için sade, pratik ve erişilebilir araçlar." : "Simple, practical and accessible tools for your documents."}</p><div className="footer-links"><a href="#all-tools">{isTR?"Tüm araçlar":"All tools"}</a><a href="#security">{isTR?"Güvenlik":"Security"}</a><a href="#top">{isTR?"Başa dön":"Back to top"}</a></div><small>© {new Date().getFullYear()} Belge Dostu</small></footer>
    </>}

    <div ref={docxRenderRef} aria-hidden="true" style={{ position: "fixed", left: "-12000px", top: 0, width: "794px", background: "#fff", color: "#000", zIndex: -1, pointerEvents: "none" }} />

    {selected && <div className="modal-backdrop" role="presentation" onClick={closeTool} style={{position:"fixed",inset:0,zIndex:9999,overflowY:"auto",overflowX:"hidden",background:"#f7f9fd",padding:0,display:"block"}}><section className="tool-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={e=>e.stopPropagation()} style={{position:"relative",width:"100%",maxWidth:"none",minHeight:"100vh",height:"auto",maxHeight:"none",overflow:"visible",margin:0,borderRadius:0,padding:"clamp(24px, 4vw, 56px)",boxSizing:"border-box",background:"#fff"}}><button className="modal-close" onClick={closeTool} aria-label="Kapat" style={{position:"fixed",top:18,right:22,zIndex:10001,width:44,height:44,background:"#fff",boxShadow:"0 2px 8px rgba(15,23,42,.08)"}}><X size={21}/></button>
      <header className="topbar" style={{margin:"-32px calc(-1 * clamp(24px, 4vw, 56px)) 28px",position:"sticky",top:0,zIndex:10000}}>
        <a className="brand" href="/" onClick={e=>{e.preventDefault();closeTool();}} aria-label="Belge Dostu ana sayfa"><span className="brand-icon"><FileText size={25}/></span><span className="brand-copy"><strong>BELGE <em>DOSTU</em></strong><small>{isTR ? "Ücretsiz çevrimiçi araçlar" : "Free online tools"}</small></span></a>
        <button className="mobile-menu-button" onClick={() => setMobileMenu(v => !v)} aria-label="Menüyü aç/kapat">{mobileMenu ? <X size={22}/> : <Menu size={22}/>}</button>
        <nav className={`nav-links ${mobileMenu ? "is-open" : ""}`}>
          <a href="/#pdf-tools" onClick={e=>{e.preventDefault();closeTool();}}>PDF Araçları</a><a href="/#convert" onClick={e=>{e.preventDefault();closeTool();}}>Dönüştür</a><a href="/#images" onClick={e=>{e.preventDefault();closeTool();}}>Görsel Araçları</a><a href="/#qr" onClick={e=>{e.preventDefault();closeTool();}}>QR Kod</a><a href="/#calculators" onClick={e=>{e.preventDefault();closeTool();}}>Hesaplamalar</a>
        </nav>
        <div className="language-switch"><button className={isTR ? "selected" : ""} onClick={() => setLanguage("TR")}>TR</button><button className={!isTR ? "selected" : ""} onClick={() => setLanguage("EN")}>EN</button></div>
      </header>
      <div style={{maxWidth:1050,margin:selected.title.toLocaleLowerCase("tr-TR").includes("metin ekle") ? "0 0 30px" : "0 auto 30px",width:"100%"}}>
        <nav aria-label="İçerik yolu" style={{display:"flex",alignItems:"center",gap:9,flexWrap:"wrap",fontSize:13,color:"#64748b",margin:"8px 0 16px"}}>
          <button type="button" onClick={closeTool} style={{border:0,background:"transparent",padding:0,color:"#64748b",cursor:"pointer"}}>Ana Sayfa</button>
          <ChevronRight size={14}/><span>{selected.title.toLocaleLowerCase("tr-TR").includes("dönüştür") || selected.title.includes("→") ? "Dönüştür" : selected.title.toLocaleLowerCase("tr-TR").includes("sıkıştır") || selected.title.toLocaleLowerCase("tr-TR").includes("böl") ? "Optimize Et" : "Düzenle"}</span>
          <ChevronRight size={14}/><strong style={{color:"#0f172a",fontWeight:500}}>{selected.title}</strong>
        </nav>
        <div style={{display:"flex",alignItems:"flex-start",gap:16,margin:"0 0 28px",maxWidth:720}}>
          <span style={{flex:"0 0 52px",width:52,height:52,borderRadius:15,background:"#eef2ff",color:"#4146d0",display:"grid",placeItems:"center"}}><FileText size={27}/></span>
          <div style={{minWidth:0}}>
            <span className="eyebrow" style={{display:"block",margin:"0 0 5px"}}>{isTR ? "ARAÇ" : "TOOL"}</span>
            <h2 id="modal-title" style={{fontSize:"clamp(24px,2.2vw,30px)",lineHeight:1.2,letterSpacing:"-0.03em",margin:"0 0 8px",color:"#111827",fontWeight:800}}>{selected.title}</h2>
            <p style={{margin:0,fontSize:15,lineHeight:1.55,color:"#64748b"}}>{selected.description}</p>
          </div>
        </div>
        <div
          onDragOver={e=>{e.preventDefault();e.currentTarget.style.borderColor="#4146d0";}}
          onDragLeave={e=>{e.currentTarget.style.borderColor="#dbe4f0";}}
          onDrop={async e=>{e.preventDefault();e.currentTarget.style.borderColor="#dbe4f0";const dropped=Array.from(e.dataTransfer.files||[]);if(dropped.length){setSelectedFiles(dropped);setTextPlacements([]);setPreviewPage(1);setToolMessage("");setFormFields([]);if(selected.title.toLocaleLowerCase("tr-TR").includes("form doldur")&&dropped[0]){try{const d=await PDFDocument.load(await dropped[0].arrayBuffer());setFormFields(d.getForm().getFields().map(f=>({name:f.getName(),value:"",type:f.constructor.name})));}catch{setToolMessage("PDF okunamadı veya şifreli olabilir.");}}}}}
          style={{border:"2px dashed #dbe4f0",borderRadius:16,background:"#f8fafc",minHeight:215,padding:"36px 20px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12,textAlign:"center",transition:"border-color .15s"}}
        >
          <span style={{display:"grid",placeItems:"center",width:52,height:52,borderRadius:14,background:"#eef2ff",color:"#4146d0"}}><UploadCloud size={28}/></span>
          <strong style={{fontSize:16,color:"#111827"}}>Dosyanızı buraya sürükleyin</strong>
          <span style={{fontSize:14,color:"#64748b"}}>veya <label style={{color:"#4146d0",textDecoration:"underline",cursor:"pointer",fontWeight:600}}>Dosya Seç
            <input type="file" accept={selected.title.toLocaleLowerCase("tr-TR").includes("word → pdf") || selected.title.toLocaleLowerCase("tr-TR").includes("word to pdf") ? ".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" : selected.title.toLocaleLowerCase("tr-TR").includes("pdf → word") || selected.title.toLocaleLowerCase("tr-TR").includes("pdf to word") ? ".pdf,application/pdf" : selected.title.includes("JPG → PDF") || selected.title.includes("PNG → PDF") || selected.title.includes("Görseller") ? "image/jpeg,image/png" : ".pdf,application/pdf"} multiple={selected.title.includes("Birleştir") || selected.title.includes("JPG → PDF") || selected.title.includes("PNG → PDF") || selected.title.includes("Görseller")} onChange={async e=>{const files=Array.from(e.target.files||[]);setSelectedFiles(files);setTextPlacements([]);setPreviewPage(1);setToolMessage("");setFormFields([]);if(selected.title.toLocaleLowerCase("tr-TR").includes("form doldur")&&files[0]){try{const d=await PDFDocument.load(await files[0].arrayBuffer());setFormFields(d.getForm().getFields().map(f=>({name:f.getName(),value:"",type:f.constructor.name})));if(!d.getForm().getFields().length)setToolMessage("Bu PDF içinde doldurulabilir form alanı bulunamadı.");}catch{setToolMessage("PDF okunamadı veya şifreli olabilir.");}}}} style={{display:"none"}} />
          </label></span>
          <small style={{fontSize:12,color:"#64748b"}}>{selectedFiles.length ? selectedFiles.map(f=>f.name).join(" · ") : "PDF · Dosyalarınız cihazınızdan ayrılmaz."}</small>
        </div>
      </div>
      {selected.title.toLocaleLowerCase("tr-TR").includes("filigran") && <label className="tool-field">Filigran metni<input value={watermarkText} onChange={e=>setWatermarkText(e.target.value)} /></label>}
      {selected.title.toLocaleLowerCase("tr-TR").includes("metin ekle") && <div style={{display:"grid",gridTemplateColumns:"minmax(0,2fr) minmax(280px,0.85fr)",gap:24,alignItems:"start",margin:"24px 0",width:"100%"}}>
        <div>
          {selectedFiles[0] && <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>{Array.from({length:previewPageCount},(_,i)=><button key={i} type="button" onClick={()=>setPreviewPage(i+1)} style={{border:previewPage===i+1?"1px solid #4146d0":"1px solid #dce3ef",background:previewPage===i+1?"#4146d0":"#f3f6fb",color:previewPage===i+1?"white":"#52617a",borderRadius:6,padding:"5px 9px",cursor:"pointer"}}>{i+1}</button>)}</div>}
          <div style={{position:"relative",border:"1px solid #dce4f2",borderRadius:12,overflow:"hidden",background:"#f7f9fd",minHeight:360}}>
            {selectedFiles[0] ? <><canvas ref={pdfPreviewCanvasRef} onClick={e=>{if(!toolText.trim()){setToolMessage("Önce eklenecek metni yazın.");return;}const rect=e.currentTarget.getBoundingClientRect();const x=(e.clientX-rect.left)/rect.width;const y=(e.clientY-rect.top)/rect.height;setTextPlacements(old=>[...old,{id:`txt-${Date.now()}-${Math.random()}`,page:previewPage,x,y,text:toolText,size:textSize,color:textColor}]);setToolMessage("");}} style={{display:"block",cursor:"crosshair",width:"100%",height:"auto"}} /><div style={{position:"absolute",inset:0,pointerEvents:"none"}}>{textPlacements.filter(x=>x.page===previewPage).map(item=><div key={item.id} style={{position:"absolute",left:`${item.x*100}%`,top:`${item.y*100}%`,transform:"translateY(-100%)",fontSize:`${Math.max(9,Math.min(24,item.size*0.72))}px`,color:item.color,whiteSpace:"pre-wrap",maxWidth:"90%",pointerEvents:"auto",display:"flex",alignItems:"flex-start",gap:3}}><span style={{background:"rgba(255,255,255,.85)"}}>{item.text}</span><button type="button" aria-label="Metni sil" onClick={ev=>{ev.stopPropagation();setTextPlacements(old=>old.filter(x=>x.id!==item.id));}} style={{border:0,borderRadius:"50%",background:"#ef4444",color:"white",width:18,height:18,lineHeight:"16px",fontSize:14,cursor:"pointer",padding:0}}>×</button></div>)}</div>
          </> : <div style={{padding:36,textAlign:"center",color:"#64748b"}}><UploadCloud size={28}/><p>Önizlemeyi açmak için yukarıdan PDF dosyanızı yükleyin.</p></div>}
          </div>
          <small style={{display:"block",width:"100%",boxSizing:"border-box",textAlign:"center",color:"#64748b",marginTop:8}}>Metni eklemek istediğiniz noktaya tıklayın. Eklenen metinleri aşağıdan × ile silebilirsiniz.</small>
          {textPlacements.length>0 && <div style={{display:"grid",gap:6,marginTop:10}}>{textPlacements.map((item,index)=><div key={item.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,border:"1px solid #e1e7f0",borderRadius:8,padding:"7px 10px",background:"white"}}><span style={{fontSize:13,color:"#334155"}}>Sayfa {item.page}: {item.text}</span><button type="button" aria-label="Metni sil" onClick={()=>setTextPlacements(old=>old.filter(x=>x.id!==item.id))} style={{border:0,borderRadius:6,background:"#fee2e2",color:"#b91c1c",fontSize:18,cursor:"pointer",width:28,height:28}}>×</button></div>)}</div>}
        </div>
        <div style={{display:"grid",gap:12}}>
          <label className="tool-field">Eklenecek metin<input value={toolText} onChange={e=>setToolText(e.target.value)} placeholder="Metninizi yazın" /></label>
          <label className="tool-field">Boyut<input type="number" min="8" max="48" value={textSize} onChange={e=>setTextSize(Math.max(8,Math.min(48,Number(e.target.value)||8)))} /></label>
          <label className="tool-field">Renk<input type="color" value={textColor} onChange={e=>setTextColor(e.target.value)} style={{width:"100%",height:42}} /></label>
          <button type="button" onClick={()=>{if(!toolText.trim()){setToolMessage("Önce eklenecek metni yazın.");return;}setToolMessage("Metni yazdıktan sonra PDF önizlemesinde istediğiniz yere tıklayın.");}} className="primary-button">Metin ekleme modunu hazırla</button>
        </div>
      </div>}
      {selected.title.toLocaleLowerCase("tr-TR").includes("imzala") && <label className="tool-field">İmza adı / metni<input value={signatureText} onChange={e=>setSignatureText(e.target.value)} placeholder="Ad Soyad" /></label>}
      {selected.title.toLocaleLowerCase("tr-TR").includes("üst üste bindir") && <label className="tool-field">Üstüne bindirilecek ikinci PDF<input type="file" accept="application/pdf,.pdf" onChange={e=>setOverlayFiles(Array.from(e.target.files||[]))}/><small>{overlayFiles.map(f=>f.name).join(", ") || "İkinci PDF seçilmedi"}</small></label>}
      {selected.title.toLocaleLowerCase("tr-TR").includes("form doldur") && formFields.map((f,i)=><label className="tool-field" key={f.name}>{f.name}<input value={f.value} onChange={e=>setFormFields(old=>old.map((x,j)=>i===j?{...x,value:e.target.value}:x))} placeholder={f.type==="PDFCheckBox"?"1 = işaretle, boş = işaretleme":"Değer gir"}/></label>)}
      {selected.title.toLocaleLowerCase("tr-TR").includes("sıkıştır") && <fieldset className="tool-field" style={{width:"100%",maxWidth:560,boxSizing:"border-box",margin:"0 auto 20px",border:"1px solid #e4e9f2",borderRadius:12,padding:12}}><legend>Sıkıştırma seviyesi</legend><div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:8}}><button type="button" onClick={()=>setCompressionLevel("low")} aria-pressed={compressionLevel==="low"} style={{padding:"12px 8px",borderRadius:9,border:compressionLevel==="low"?"2px solid #4146d0":"1px solid #dce3ef",background:compressionLevel==="low"?"#eef2ff":"white",color:"#26324a"}}><strong>Düşük</strong><br/><small>En iyi kalite</small></button><button type="button" onClick={()=>setCompressionLevel("medium")} aria-pressed={compressionLevel==="medium"} style={{padding:"12px 8px",borderRadius:9,border:compressionLevel==="medium"?"2px solid #4146d0":"1px solid #dce3ef",background:compressionLevel==="medium"?"#eef2ff":"white",color:"#26324a"}}><strong>Orta</strong><br/><small>Dengeli</small></button><button type="button" onClick={()=>setCompressionLevel("high")} aria-pressed={compressionLevel==="high"} style={{padding:"12px 8px",borderRadius:9,border:compressionLevel==="high"?"2px solid #4146d0":"1px solid #dce3ef",background:compressionLevel==="high"?"#eef2ff":"white",color:"#26324a"}}><strong>Yüksek</strong><br/><small>En küçük hedef</small></button></div><small>Yüksek sıkıştırmada görüntü kalitesi düşebilir. Bu işlem sayfaları görüntüye dönüştürür; metin seçilebilirliği kaybolur.</small></fieldset>}
      {selected.title.toLocaleLowerCase("tr-TR").includes("sayfa numarası") && <fieldset className="tool-field" style={{width:"100%",maxWidth:560,boxSizing:"border-box",margin:"0 auto 20px",border:"1px solid #e4e9f2",borderRadius:12,padding:12}}><legend>Sayfa numarası konumu</legend><div style={{display:"flex",gap:16,flexWrap:"wrap",marginBottom:14}}><label style={{display:"flex",alignItems:"center",gap:6}}><input type="radio" name="page-number-position" value="left" checked={pageNumberPosition === "left"} onChange={() => setPageNumberPosition("left")} /> Sol</label><label style={{display:"flex",alignItems:"center",gap:6}}><input type="radio" name="page-number-position" value="center" checked={pageNumberPosition === "center"} onChange={() => setPageNumberPosition("center")} /> Orta</label><label style={{display:"flex",alignItems:"center",gap:6}}><input type="radio" name="page-number-position" value="right" checked={pageNumberPosition === "right"} onChange={() => setPageNumberPosition("right")} /> Sağ</label></div><legend>Sayfa numarası rengi</legend><div style={{display:"flex",gap:16,flexWrap:"wrap"}}><label style={{display:"flex",alignItems:"center",gap:6}}><input type="radio" name="page-number-color" value="black" checked={pageNumberColor === "black"} onChange={() => setPageNumberColor("black")} /><span style={{display:"inline-block",width:14,height:14,borderRadius:"50%",background:"#000",border:"1px solid #777"}}/> Siyah</label><label style={{display:"flex",alignItems:"center",gap:6}}><input type="radio" name="page-number-color" value="blue" checked={pageNumberColor === "blue"} onChange={() => setPageNumberColor("blue")} /><span style={{display:"inline-block",width:14,height:14,borderRadius:"50%",background:"#1f52f2"}}/> Mavi</label><label style={{display:"flex",alignItems:"center",gap:6}}><input type="radio" name="page-number-color" value="red" checked={pageNumberColor === "red"} onChange={() => setPageNumberColor("red")} /><span style={{display:"inline-block",width:14,height:14,borderRadius:"50%",background:"#e01f29"}}/> Kırmızı</label></div><small>Numaralar sayfanın alt kısmına seçtiğin konum ve renkte eklenir.</small></fieldset>}
      {(selected.title.toLocaleLowerCase("tr-TR").includes("sil") || selected.title.toLocaleLowerCase("tr-TR").includes("çıkar") || selected.title.toLocaleLowerCase("tr-TR").includes("böl")) && <label className="tool-field" style={{display:"block",width:"100%",maxWidth:560,margin:"0 auto 20px",boxSizing:"border-box"}}>Sayfa numaraları<input style={{width:"100%",boxSizing:"border-box"}} value={pageInput} onChange={e=>setPageInput(e.target.value)} placeholder="Örn. 1,3,5" /><small>Virgülle ayır. Sayfa numaraları 1’den başlar.</small></label>}
      {false && !selected.title.toLocaleLowerCase("tr-TR").includes("metin ekle") && <label className="modal-upload"><UploadCloud size={29}/><strong>{selected.title.includes("Birleştir") || selected.title.toLocaleLowerCase("tr-TR").includes("word → pdf") || selected.title.includes("JPG → PDF") || selected.title.includes("PNG → PDF") || selected.title.includes("Görseller") ? "Dosyaları seç" : "PDF dosyanı seç"}</strong><span>{selected.title.includes("Birleştir") ? "Birleştirmek istediğin en az iki PDF dosyasını seç." : "Seçtiğin dosyalar bu araçta tarayıcında işlenir."}<br/>{selectedFiles.length ? selectedFiles.map(f=>f.name).join(" · ") : "Henüz dosya seçilmedi."}</span><input type="file" accept={selected.title.toLocaleLowerCase("tr-TR").includes("word → pdf") || selected.title.toLocaleLowerCase("tr-TR").includes("word to pdf") ? ".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" : selected.title.toLocaleLowerCase("tr-TR").includes("pdf → word") || selected.title.toLocaleLowerCase("tr-TR").includes("pdf to word") ? ".pdf,application/pdf" : selected.title.includes("JPG → PDF") || selected.title.includes("PNG → PDF") || selected.title.includes("Görseller") ? "image/jpeg,image/png" : ".pdf,application/pdf"} multiple={selected.title.includes("Birleştir") || selected.title.includes("JPG → PDF") || selected.title.includes("PNG → PDF") || selected.title.includes("Görseller")} onChange={async e=>{const files=Array.from(e.target.files??[]);setSelectedFiles(files);setFormFields([]);if(selected.title.toLocaleLowerCase("tr-TR").includes("form doldur")&&files[0]){try{const d=await PDFDocument.load(await files[0].arrayBuffer());setFormFields(d.getForm().getFields().map(f=>({name:f.getName(),value:"",type:f.constructor.name})));if(!d.getForm().getFields().length)setToolMessage("Bu PDF içinde doldurulabilir form alanı bulunamadı.");}catch{setToolMessage("PDF okunamadı veya şifreli olabilir.");}}}}/></label>}
      <div style={{display:"flex",justifyContent:"center",width:"100%",margin:"20px 0 0"}}><button className="primary-button" onClick={runSelectedTool} disabled={isProcessing} style={{display:"inline-flex",width:"auto",minWidth:140,maxWidth:"100%",alignItems:"center",justifyContent:"center",padding:"15px 24px",margin:0,whiteSpace:"normal",textAlign:"center"}}>{isProcessing ? "İşleniyor…" : selected.title}</button></div>{toolMessage && <p className="tool-message" role="status">{toolMessage}</p>}<p className="tool-note" style={{textAlign:"center",width:"100%",maxWidth:1100,margin:"20px auto 0",lineHeight:1.7}}>Dosyalarınız sizin kontrolünüzde. PDF’leri düzenleyin, dönüştürün, sıkıştırın ve daha fazlasını yapın. Ücretsiz, hızlı ve kolay.</p>
      <section style={{background:"#f7f9fc",margin:"42px calc(-1 * clamp(24px, 4vw, 56px)) 0",padding:"42px clamp(24px, 4vw, 56px)"}}>
        <div style={{maxWidth:1000,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:36}}>
          <div><h2 style={{fontSize:22,margin:"0 0 22px",color:"#101b32"}}>Nasıl kullanılır?</h2>{[`${selected.title} aracını açın ve dosyanızı seçin.`,`Gerekli ayarları ve seçenekleri belirleyin.`,`İşlemi başlatın ve tamamlanmasını bekleyin.`,`Hazırlanan dosyayı cihazınıza indirin.`].map((step,i)=><div key={step} style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:14,color:"#536581",fontSize:14,lineHeight:1.6}}><span style={{flex:"0 0 24px",height:24,borderRadius:"50%",display:"grid",placeItems:"center",background:"#4146d0",color:"white",fontWeight:700,fontSize:12}}>{i+1}</span><span>{step}</span></div>)}</div>
          <div><h2 style={{fontSize:22,margin:"0 0 22px",color:"#101b32"}}>Neden Belge Dostu?</h2>{["Ücretsiz kullanım","Üyelik gerektirmez","Dosyalarınız mümkün olduğunca tarayıcınızda işlenir","Basit ve anlaşılır araçlar"].map(t=><p key={t} style={{margin:"0 0 14px",color:"#536581",fontSize:14}}><span style={{color:"#0d9f79",marginRight:10}}>✓</span>{t}</p>)}</div>
        </div>
      </section>
      <section style={{maxWidth:1000,margin:"0 auto",padding:"42px 0 12px"}}>
        <h2 style={{fontSize:24,textAlign:"center",margin:"0 0 24px",color:"#101b32"}}>İlgili Araçlar</h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:14}}>{relatedItems.map(item=>{const RelatedIcon=iconForTool(item.title);const palette=iconPaletteForTool(item.title);return <button key={item.title} type="button" className="tool-card" onClick={()=>openTool(item)} onMouseEnter={e=>{const icon=e.currentTarget.querySelector<HTMLElement>(".related-tool-icon");if(icon){icon.style.backgroundColor=palette.color;icon.style.color="#fff";icon.style.transform="translateY(-1px)";}}} onMouseLeave={e=>{const icon=e.currentTarget.querySelector<HTMLElement>(".related-tool-icon");if(icon){icon.style.backgroundColor=palette.backgroundColor;icon.style.color=palette.color;icon.style.transform="translateY(0)";}}} style={{position:"relative",textAlign:"left",border:"1px solid #dfe6f1",borderRadius:14,padding:18,background:"white",cursor:"pointer",color:"#15213a",transition:"border-color .18s ease, box-shadow .18s ease"}}><span className="related-tool-icon" style={{display:"grid",placeItems:"center",width:40,height:40,borderRadius:12,backgroundColor:palette.backgroundColor,color:palette.color,marginBottom:12,transition:"background-color .18s ease,color .18s ease,transform .18s ease"}}><RelatedIcon size={21}/></span><strong>{item.title}</strong><p style={{color:"#667792",fontSize:13,lineHeight:1.5,margin:"8px 0 0"}}>{item.description}</p></button>})}</div>
      </section>
      <section style={{maxWidth:1000,margin:"0 auto",padding:"42px 0 56px"}}>
        <h2 style={{fontSize:24,textAlign:"center",margin:"0 0 24px",color:"#101b32"}}>Sıkça Sorulan Sorular</h2>
        {[{q:`${selected.title} ücretsiz mi?`,a:"Evet, Belge Dostu araçları ücretsiz kullanılabilir ve üyelik gerektirmez."},{q:"Dosyalarım sunucuya yükleniyor mu?",a:"Desteklenen işlemler tarayıcınızda yapılır. Dosyanızın işlenme biçimi kullandığınız araca ve gerekli kütüphanelere bağlıdır."},{q:"İşlem tamamlandığında dosyamı nasıl alırım?",a:"İşlemi başlat düğmesine bastıktan sonra işlem başarılı olursa dosya indirme işlemi otomatik başlar."},{q:"Araç çalışmazsa ne yapmalıyım?",a:"Dosyanın doğru biçimde ve bozuk olmadığından emin olun. Sorun devam ederse dosyayı yeniden seçip tekrar deneyin."}].map((faq,i)=><details key={faq.q} open={i===0} style={{border:"1px solid #dfe6f1",borderRadius:10,padding:"16px 18px",marginBottom:8,background:"#f8fafc"}}><summary style={{cursor:"pointer",fontWeight:650,color:"#17243c"}}>{faq.q}</summary><p style={{color:"#637590",fontSize:14,lineHeight:1.7,margin:"12px 0 0"}}>{faq.a}</p></details>)}
      </section>
      <footer style={{margin:"0 calc(-1 * clamp(24px, 4vw, 56px))",padding:"30px clamp(24px, 4vw, 56px)",background:"#f7f9fc",borderTop:"1px solid #e2e8f0",display:"flex",alignItems:"center",justifyContent:"space-between",gap:16,flexWrap:"wrap",color:"#64748b",fontSize:13}}><strong style={{color:"#172554"}}>BELGE DOSTU</strong><span>Dosyalarınız sizin kontrolünüzde. Ücretsiz, hızlı ve kolay.</span><button type="button" onClick={closeTool} style={{border:0,background:"transparent",color:"#4057f5",cursor:"pointer",fontWeight:700}}>Tüm araçlara dön ↑</button></footer>
      </section></div>}
  </main>;
}

function iconForTool(title: string) {
  const t = title.toLocaleLowerCase("tr-TR");
  if (t.includes("metin ekle")) return Type;
  if (t.includes("imzala")) return PenLine;
  if (t.includes("sayfa numarası")) return ListOrdered;
  if (t.includes("filigran")) return Stamp;
  if (t.includes("form doldur") || t.includes("form oluştur")) return FilePenLine;
  if (t.includes("ocr")) return ScanText;
  if (t.includes("gri tonlama") || t.includes("siyah-beyaz") || t.includes("görsel sıkıştır")) return ImageIcon;
  if (t.includes("üst üste bindir") || t.includes("overlay")) return Layers;
  if (t.includes("birleştir")) return Files;
  if (t.includes("sayfalarını sil") || t.includes("sayfa sil")) return FileMinus;
  if (t.includes("sırala")) return ArrowDownUp;
  if (t.includes("döndür")) return RotateCw;
  if (t.includes("çıkar")) return FileOutput;
  if (t.includes("boş sayfa")) return FilePlus;
  if (t.includes("kırp")) return Crop;
  if (t.includes("kitapçık") || t.includes("epub")) return BookOpen;
  if (t.includes("sıkıştır") || t.includes("compress") || t.includes("optimize")) return Minimize2;
  if (t.includes("onar") || t.includes("tamir")) return Wrench;
  if (t.includes("şifre") || t.includes("şifrele") || t.includes("güvenlik")) return FileKey;
  if (t.includes("metadata")) return Info;
  if (t.includes("redact") || t.includes("gizleme")) return Eraser;
  if (t.includes("word")) return FileType;
  if (t.includes("excel") || t.includes("tablo")) return Table;
  if (t.includes("powerpoint") || t.includes("sunum")) return Presentation;
  if (t.includes("pdf → jpg") || t.includes("pdf → png") || t.includes("jpg → png") || t.includes("png → jpg") || t.includes("webp") || t.includes("görsel")) return ImagePlus;
  if (t.includes("qr kod")) return QrCode;
  if (t.includes("barkod")) return Barcode;
  if (t.includes("wi-fi")) return Wifi;
  if (t.includes("whatsapp")) return MessageCircle;
  if (t.includes("instagram")) return Instagram;
  if (t.includes("yüzde")) return Percent;
  if (t.includes("kdv") || t.includes("kâr-zarar") || t.includes("indirim") || t.includes("faiz") || t.includes("kredi")) return CircleDollarSign;
  if (t.includes("yaş") || t.includes("tarih")) return CalendarDays;
  if (t.includes("birim")) return Ruler;
  if (t.includes("böl")) return Scissors;
  if (t.includes("sayfa")) return FileText;
  if (t.includes("dönüştür") || t.includes("pdf →")) return FileImage;
  return FileText;
}

function iconPaletteForTool(title: string): { color: string; backgroundColor: string } {
  const t = title.toLocaleLowerCase("tr-TR");
  if (t.includes("sayfa numarası") || t.includes("sayfa numaraları")) return { color: "#a855f7", backgroundColor: "#faf5ff" };
  if (t.includes("filigran")) return { color: "#9333ea", backgroundColor: "#f5f0ff" };
  if (t.includes("metin ekle")) return { color: "#9333ea", backgroundColor: "#f7f0ff" };
  if (t.includes("imzala")) return { color: "#7c3aed", backgroundColor: "#f5f3ff" };
  if (t.includes("ocr")) return { color: "#4f46e5", backgroundColor: "#eef2ff" };
  if (t.includes("redact") || t.includes("gizleme") || t.includes("sil")) return { color: "#0d9488", backgroundColor: "#f0fdfa" };
  if (t.includes("form")) return { color: "#0284c7", backgroundColor: "#eff6ff" };
  if (t.includes("birleştir")) return { color: "#4f46e5", backgroundColor: "#eef2ff" };
  if (t.includes("böl") || t.includes("çıkar") || t.includes("makas")) return { color: "#ea580c", backgroundColor: "#fff7ed" };
  if (t.includes("döndür") || t.includes("sırala")) return { color: "#0891b2", backgroundColor: "#ecfeff" };
  if (t.includes("sıkıştır") || t.includes("optimize")) return { color: "#0d9488", backgroundColor: "#f0fdfa" };
  if (t.includes("şifre") || t.includes("güvenlik") || t.includes("metadata")) return { color: "#64748b", backgroundColor: "#f1f5f9" };
  if (t.includes("gri tonlama") || t.includes("siyah-beyaz") || t.includes("görsel")) return { color: "#2563eb", backgroundColor: "#eff6ff" };
  if (t.includes("qr") || t.includes("barkod") || t.includes("wi-fi") || t.includes("whatsapp") || t.includes("instagram")) return { color: "#db2777", backgroundColor: "#fdf2f8" };
  if (t.includes("yüzde") || t.includes("kdv") || t.includes("kâr-zarar") || t.includes("indirim") || t.includes("faiz") || t.includes("kredi")) return { color: "#059669", backgroundColor: "#ecfdf5" };
  if (t.includes("yaş") || t.includes("tarih")) return { color: "#d97706", backgroundColor: "#fffbeb" };
  if (t.includes("birim")) return { color: "#475569", backgroundColor: "#f1f5f9" };
  if (t.includes("word") || t.includes("excel") || t.includes("powerpoint")) return { color: "#2563eb", backgroundColor: "#eff6ff" };
  return { color: "#6366f1", backgroundColor: "#eef2ff" };
}

function ToolCard({ item, onClick, popular = false }: { item: ToolItem; onClick: (item: ToolItem) => void; popular?: boolean }) {
  const ToolIcon = iconForTool(item.title);
  const iconPalette = iconPaletteForTool(item.title);
  return <button type="button" className="tool-card" onClick={() => onClick(item)} onMouseEnter={e => { const icon = e.currentTarget.querySelector<HTMLElement>(".tool-card-icon"); if (icon) { icon.style.backgroundColor = iconPalette.color; icon.style.color = "#ffffff"; icon.style.transform = "translateY(-1px)"; } }} onMouseLeave={e => { const icon = e.currentTarget.querySelector<HTMLElement>(".tool-card-icon"); if (icon) { icon.style.backgroundColor = iconPalette.backgroundColor; icon.style.color = iconPalette.color; icon.style.transform = "translateY(0)"; } }}><span className="tool-card-icon" style={{...iconPalette, transition:"background-color .18s ease, color .18s ease, transform .18s ease"}}><ToolIcon size={23}/></span>{popular && <span className="popular-badge">Popüler</span>}<h3>{item.title}</h3><p>{item.description}</p><span className="card-action">Aracı aç <ChevronRight size={15}/></span></button>;
}
