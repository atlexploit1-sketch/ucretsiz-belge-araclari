"use client";

import { ChangeEvent, useRef, useState } from "react";
import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";
import JSZip from "jszip";
import {
  FileText, Files, UploadCloud, ShieldCheck, Heart, GraduationCap,
  X, Check, Trash2, Scissors, RotateCw, Image as ImageIcon,
  Highlighter, Sparkles, Hash, Stamp, Download, Copy, FilePlus, Minimize2
} from "lucide-react";

type ToolId = "merge" | "split" | "rotate" | "images" | "number" | "watermark" | "delete" | "reorder" | "duplicate" | "blank" | "compress" | "pdfImages";
type ToolCard = { id: ToolId; title: string; description: string; icon: typeof Files; available: boolean };

const tools: ToolCard[] = [
  { id: "merge", title: "PDF birleştir", description: "Birden fazla PDF dosyasını tek belgede birleştir.", icon: Files, available: true },
  { id: "split", title: "PDF böl / sayfa çıkar", description: "İstediğin sayfaları seçip ayrı PDF olarak indir.", icon: Scissors, available: true },
  { id: "rotate", title: "PDF döndür", description: "PDF sayfalarının yönünü düzelt.", icon: RotateCw, available: true },
  { id: "images", title: "Görselleri PDF yap", description: "JPG ve PNG görsellerini tek PDF dosyasında topla.", icon: ImageIcon, available: true },
  { id: "number", title: "Sayfa numarası ekle", description: "Sayfalara numara ekleyerek belgeyi düzenle.", icon: Hash, available: true },
  { id: "watermark", title: "Filigran ekle", description: "PDF sayfalarına metin filigranı ekle.", icon: Stamp, available: true },
  { id: "delete", title: "PDF sayfası sil", description: "İstemediğin sayfaları belgeden çıkar.", icon: Trash2, available: true },
  { id: "reorder", title: "Sayfaları sırala", description: "Sayfaların sırasını kendin belirle.", icon: Files, available: true },
  { id: "duplicate", title: "Sayfaları çoğalt", description: "Seçtiğin sayfaların kopyalarını belgenin sonuna ekle.", icon: Copy, available: true },
  { id: "blank", title: "Boş sayfa ekle", description: "PDF belgesinin sonuna yeni boş sayfalar ekle.", icon: FilePlus, available: true },
  { id: "compress", title: "PDF sıkıştır", description: "Sayfaları görüntü tabanlı PDF olarak yeniden oluşturarak dosya boyutunu azaltmayı dene.", icon: Minimize2, available: true },
  { id: "pdfImages", title: "PDF’den JPG/PNG çıkar", description: "PDF sayfalarını PNG görselleri olarak dışa aktar ve ZIP indir.", icon: ImageIcon, available: true },
];

function parsePageRange(value: string, total: number): number[] {
  const pages = new Set<number>();
  const parts = value.split(",").map((part) => part.trim());
  if (!value.trim() || parts.some((part) => !part)) throw new Error("Sayfa aralığını gir. Örnek: 1-3, 5, 8-10");
  for (const part of parts) {
    const match = part.match(/^(\d+)(?:\s*-\s*(\d+))?$/);
    if (!match) throw new Error("Geçersiz biçim. Örnek: 1-3, 5, 8-10");
    const start = Number(match[1]);
    const end = match[2] ? Number(match[2]) : start;
    if (start < 1 || end < start || end > total) throw new Error(`Sayfa numaraları 1 ile ${total} arasında olmalı.`);
    for (let page = start; page <= end; page++) pages.add(page - 1);
  }
  return [...pages].sort((a, b) => a - b);
}

function downloadPdf(bytes: Uint8Array, filename: string) {
  const blob = new Blob([new Uint8Array(bytes).buffer as ArrayBuffer], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export default function Home() {
  const [activeTool, setActiveTool] = useState<ToolId>("merge");
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [pageRange, setPageRange] = useState("1-3");
  const [rotation, setRotation] = useState("90");
  const [watermark, setWatermark] = useState("BELGE DOSTU");
  const [firstNumber, setFirstNumber] = useState("1");
  const [deleteRange, setDeleteRange] = useState("1");
  const [pageOrder, setPageOrder] = useState("1, 2, 3");
  const [duplicateRange, setDuplicateRange] = useState("1");
  const [blankCount, setBlankCount] = useState("1");
  const [compressionLevel, setCompressionLevel] = useState("medium");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const totalBytes = pdfFiles.reduce((sum, file) => sum + file.size, 0);

  function selectPdfFiles(list: FileList | null, replace = false) {
    if (!list) return;
    const selected = Array.from(list);
    const valid = selected.filter((file) => file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf"));
    if (valid.length !== selected.length) setMessage("Yalnızca PDF dosyaları eklenebilir.");
    else setMessage("");
    setPdfFiles((old) => replace ? valid.slice(0, 1) : [...old, ...valid]);
  }

  function chooseTool(id: ToolId) {
    setActiveTool(id);
    setMessage("");
    setPdfFiles([]);
    setImageFiles([]);
  }

  async function runTool() {
    setBusy(true);
    setMessage("");
    try {
      if (activeTool === "compress" || activeTool === "pdfImages") {
        if (pdfFiles.length !== 1) throw new Error("Bu işlem için yalnızca bir PDF dosyası seç.");
        const pdfjs: any = await import("pdfjs-dist/legacy/build/pdf.mjs");
        if (!pdfjs.GlobalWorkerOptions.workerSrc) {
          pdfjs.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs";
        }
        const loadingTask = pdfjs.getDocument({ data: new Uint8Array(await pdfFiles[0].arrayBuffer()), disableWorker: true, isEvalSupported: false });
        const renderedPdf = await loadingTask.promise;
        const baseName = pdfFiles[0].name.replace(/\.pdf$/i, "");

        if (activeTool === "pdfImages") {
          const zip = new JSZip();
          for (let pageNumber = 1; pageNumber <= renderedPdf.numPages; pageNumber++) {
            const page = await renderedPdf.getPage(pageNumber);
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement("canvas");
            canvas.width = Math.ceil(viewport.width);
            canvas.height = Math.ceil(viewport.height);
            const context = canvas.getContext("2d");
            if (!context) throw new Error("Tarayıcı görüntü alanını oluşturamadı.");
            await page.render({ canvasContext: context, viewport }).promise;
            const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error("PNG görseli oluşturulamadı.")), "image/png"));
            zip.file(`${baseName}-sayfa-${String(pageNumber).padStart(3, "0")}.png`, blob);
            canvas.width = 0;
            canvas.height = 0;
          }
          const zipBlob = await zip.generateAsync({ type: "blob" });
          const url = URL.createObjectURL(zipBlob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `${baseName}-sayfa-gorselleri.zip`;
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.setTimeout(() => URL.revokeObjectURL(url), 1500);
          setMessage(`${renderedPdf.numPages} sayfa PNG olarak hazırlandı ve ZIP dosyası indirildi.`);
          return;
        }

        const presets: Record<string, { scale: number; quality: number; label: string }> = {
          strong: { scale: 0.9, quality: 0.42, label: "Güçlü" },
          medium: { scale: 1.25, quality: 0.58, label: "Dengeli" },
          light: { scale: 1.7, quality: 0.76, label: "Hafif" },
        };
        const preset = presets[compressionLevel] ?? presets.medium;
        const compressed = await PDFDocument.create();
        for (let pageNumber = 1; pageNumber <= renderedPdf.numPages; pageNumber++) {
          const page = await renderedPdf.getPage(pageNumber);
          const originalViewport = page.getViewport({ scale: 1 });
          const viewport = page.getViewport({ scale: preset.scale });
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.ceil(viewport.width));
          canvas.height = Math.max(1, Math.ceil(viewport.height));
          const context = canvas.getContext("2d");
          if (!context) throw new Error("Tarayıcı görüntü alanını oluşturamadı.");
          await page.render({ canvasContext: context, viewport }).promise;
          const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error("Sıkıştırılmış sayfa oluşturulamadı.")), "image/jpeg", preset.quality));
          const imageBytes = new Uint8Array(await blob.arrayBuffer());
          const embedded = await compressed.embedJpg(imageBytes);
          const outputPage = compressed.addPage([originalViewport.width, originalViewport.height]);
          outputPage.drawImage(embedded, { x: 0, y: 0, width: originalViewport.width, height: originalViewport.height });
          canvas.width = 0;
          canvas.height = 0;
        }
        const outputBytes = await compressed.save();
        downloadPdf(outputBytes, `${baseName}-sikistirilmis.pdf`);
        const originalSize = pdfFiles[0].size;
        const outputSize = outputBytes.byteLength;
        const difference = originalSize > 0 ? Math.round((1 - outputSize / originalSize) * 100) : 0;
        setMessage(`İşlem tamamlandı (${preset.label}). Önce: ${formatSize(originalSize)} · Sonra: ${formatSize(outputSize)} · ${difference >= 0 ? `%${difference} küçülme` : `%${Math.abs(difference)} büyüme`}. Bu yöntem sayfaları görüntüye dönüştürür; metin seçilebilirliği ve bağlantılar korunmaz.`);
        return;
      }

      if (activeTool === "images") {
        if (!imageFiles.length) throw new Error("Önce JPG veya PNG görselleri seç.");
        const out = await PDFDocument.create();
        for (const file of imageFiles) {
          const data = new Uint8Array(await file.arrayBuffer());
          const isPng = file.type === "image/png" || file.name.toLowerCase().endsWith(".png");
          const image = isPng ? await out.embedPng(data) : await out.embedJpg(data);
          const page = out.addPage([image.width, image.height]);
          page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
        }
        downloadPdf(await out.save(), "gorsellerden-olusan-belge.pdf");
        setMessage(`${imageFiles.length} görsel PDF dosyasına dönüştürüldü.`);
        return;
      }

      if (!pdfFiles.length) throw new Error("Önce bir PDF dosyası seç.");
      if (activeTool === "merge" && pdfFiles.length < 2) throw new Error("Birleştirmek için en az iki PDF seç.");
      if (activeTool !== "merge" && pdfFiles.length !== 1) throw new Error("Bu işlem için yalnızca bir PDF dosyası seç.");

      if (activeTool === "merge") {
        const out = await PDFDocument.create();
        for (const file of pdfFiles) {
          const input = await PDFDocument.load(await file.arrayBuffer());
          const pages = await out.copyPages(input, input.getPageIndices());
          pages.forEach((page) => out.addPage(page));
        }
        downloadPdf(await out.save(), "birlesik-belge.pdf");
        setMessage(`${pdfFiles.length} PDF başarıyla birleştirildi.`);
        return;
      }

      const source = await PDFDocument.load(await pdfFiles[0].arrayBuffer());
      const count = source.getPageCount();
      const name = pdfFiles[0].name.replace(/\.pdf$/i, "");

      if (activeTool === "split") {
        const indexes = parsePageRange(pageRange, count);
        const out = await PDFDocument.create();
        const pages = await out.copyPages(source, indexes);
        pages.forEach((page) => out.addPage(page));
        downloadPdf(await out.save(), `${name}-sayfalar.pdf`);
        setMessage(`${pages.length} sayfa ayrı PDF olarak indirildi.`);
      } else if (activeTool === "rotate") {
        const angle = Number(rotation);
        if (![90, 180, 270].includes(angle)) throw new Error("Döndürme açısı 90, 180 veya 270 derece olmalı.");
        source.getPages().forEach((page) => page.setRotation(degrees((page.getRotation().angle + angle) % 360)));
        downloadPdf(await source.save(), `${name}-dondurulmus.pdf`);
        setMessage(`${count} sayfanın yönü güncellendi.`);
      } else if (activeTool === "delete") {
        const indexes = parsePageRange(deleteRange, count);
        if (indexes.length >= count) throw new Error("PDF'de en az bir sayfa kalmalı.");
        indexes.sort((a, b) => b - a).forEach((index) => source.removePage(index));
        downloadPdf(await source.save(), `${name}-sayfalari-silinmis.pdf`);
        setMessage(`${indexes.length} sayfa belgeden silindi.`);
      } else if (activeTool === "reorder") {
        const raw = pageOrder.split(",").map((part) => part.trim());
        if (raw.some((part) => !/^\d+$/.test(part))) throw new Error("Sayfa sırasını virgülle ayırarak yaz. Örnek: 3, 1, 2");
        const indexes = raw.map((part) => Number(part) - 1);
        if (indexes.length !== count || indexes.some((index) => index < 0 || index >= count) || new Set(indexes).size !== count) {
          throw new Error(`Tüm ${count} sayfayı, her birini bir kez kullanarak sırala. Örnek: 3, 1, 2`);
        }
        const out = await PDFDocument.create();
        const pages = await out.copyPages(source, indexes);
        pages.forEach((page) => out.addPage(page));
        downloadPdf(await out.save(), `${name}-sayfa-sirasi.pdf`);
        setMessage("Sayfa sırası güncellendi.");
      } else if (activeTool === "duplicate") {
        const indexes = parsePageRange(duplicateRange, count);
        const out = await PDFDocument.create();
        const originalPages = await out.copyPages(source, source.getPageIndices());
        originalPages.forEach((page) => out.addPage(page));
        const copies = await out.copyPages(source, indexes);
        copies.forEach((page) => out.addPage(page));
        downloadPdf(await out.save(), `${name}-sayfalar-cogaltilmis.pdf`);
        setMessage(`${copies.length} sayfanın kopyası belgenin sonuna eklendi.`);
      } else if (activeTool === "blank") {
        const amount = Number(blankCount);
        if (!Number.isInteger(amount) || amount < 1 || amount > 20) throw new Error("1 ile 20 arasında boş sayfa ekleyebilirsin.");
        const firstPage = source.getPage(0);
        const { width, height } = firstPage.getSize();
        for (let index = 0; index < amount; index++) source.addPage([width, height]);
        downloadPdf(await source.save(), `${name}-bos-sayfa-eklenmis.pdf`);
        setMessage(`${amount} boş sayfa belgenin sonuna eklendi.`);
      } else if (activeTool === "number") {
        const font = await source.embedFont(StandardFonts.Helvetica);
        const start = Number(firstNumber);
        if (!Number.isInteger(start) || start < 0) throw new Error("Başlangıç numarası sıfır veya daha büyük bir tam sayı olmalı.");
        source.getPages().forEach((page, index) => {
          const { width } = page.getSize();
          const text = String(start + index);
          page.drawText(text, { x: width / 2 - font.widthOfTextAtSize(text, 10) / 2, y: 18, size: 10, font, color: rgb(0.35, 0.39, 0.48) });
        });
        downloadPdf(await source.save(), `${name}-sayfa-numarali.pdf`);
        setMessage("Sayfa numaraları eklendi.");
      } else if (activeTool === "watermark") {
        const text = watermark.trim();
        if (!text) throw new Error("Filigran metnini gir.");
        const font = await source.embedFont(StandardFonts.HelveticaBold);
        source.getPages().forEach((page) => {
          const { width, height } = page.getSize();
          const size = Math.min(42, Math.max(20, width / Math.max(text.length, 8)));
          page.drawText(text, { x: Math.max(20, (width - font.widthOfTextAtSize(text, size)) / 2), y: height / 2, size, font, color: rgb(0.72, 0.75, 0.81), opacity: 0.32, rotate: degrees(-25) });
        });
        downloadPdf(await source.save(), `${name}-filigranli.pdf`);
        setMessage("Filigran eklendi.");
      }
    } catch (error) {
      console.error("Belge işlemi hatası:", error);
      setMessage(error instanceof Error ? error.message : "İşlem tamamlanamadı. PDF dosyasını kontrol edip tekrar dene.");
    } finally {
      setBusy(false);
    }
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    const valid = selected.filter((file) => ["image/jpeg", "image/png"].includes(file.type) || /\.(jpe?g|png)$/i.test(file.name));
    setImageFiles((old) => [...old, ...valid]);
    if (valid.length !== selected.length) setMessage("Şimdilik yalnızca JPG ve PNG görselleri destekleniyor.");
    else setMessage("");
    event.target.value = "";
  }

  const current = tools.find((tool) => tool.id === activeTool)!;
  const CurrentIcon = current.icon;

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Belge Dostu ana sayfa">
          <span className="brand-icon"><FileText size={25} /></span>
          <span>belge<span className="blue">dostu</span><small>Ücretsiz belge araçları</small></span>
        </a>
        <nav className="nav-links" aria-label="Ana menü">
          <a href="#araclar">Araçlar</a><a href="#ogrenciler">Öğrenciler için</a>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <span className="eyebrow">✦ Herkes için ücretsiz</span>
          <h1>Belgelerin hazır.<br /><span className="blue">İşin kolay.</span></h1>
          <p>PDF belgelerini kolayca düzenle. Öğrenciler ve herkes için erişilebilir, sade ve gizliliğe önem veren belge araçları.</p>
          <a className="primary-button" href="#araclar">Araçları keşfet ↓</a>
          <div className="trust"><span><ShieldCheck size={17} /> Dosyaların cihazında işlenir</span><span><Heart size={17} /> Ücretsiz kullanım hedefi</span></div>
        </div>
        <section className="upload-card hero-tool" aria-label="Hızlı PDF işlemi">
          <div className="card-heading"><span className="card-icon"><Files size={23} /></span><div><h2>PDF araçları</h2><p>İşlem seç, dosyanı yükle ve indir.</p></div></div>
          <div className="quick-tool-grid">
            {tools.slice(0, 4).map((tool) => { const Icon = tool.icon; return <button key={tool.id} className={`quick-tool ${activeTool === tool.id ? "selected" : ""}`} onClick={() => { chooseTool(tool.id); document.getElementById("araclar")?.scrollIntoView({ behavior: "smooth" }); }}><Icon size={20} /><span>{tool.title}</span></button>; })}
          </div>
          <p className="privacy"><ShieldCheck size={15} /> Dosyalar bu araçlarda tarayıcında işlenir.</p>
        </section>
      </section>

      <section className="tools" id="araclar">
        <span className="eyebrow">Belge araçları</span>
        <h2>İhtiyacın olan <span className="blue">araçlar</span></h2>
        <p className="section-intro">Bir araç seç. Dosyaların mümkün olduğunca cihazında işlenir.</p>
        <div className="tool-grid">
          {tools.map((tool) => { const Icon = tool.icon; return <button type="button" key={tool.id} className={`tool-card ${activeTool === tool.id ? "active" : ""}`} onClick={() => { chooseTool(tool.id); document.getElementById("tool-workspace")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}><span className="tool-card-icon"><Icon size={24} /></span><h3>{tool.title}</h3><p>{tool.description}</p><span className="available"><Check size={14} /> Kullanılabilir</span></button>; })}
        </div>
      </section>

      <section className="tools workspace-section" id="tool-workspace">
        <span className="eyebrow">Seçili araç</span>
        <h2>{current.title}</h2>
        <p className="section-intro">{current.description} İşlem cihazındaki tarayıcıda yapılır.</p>
        <div className="upload-card workspace-card">
          <div className="card-heading"><span className="card-icon"><CurrentIcon size={23} /></span><div><h2>{current.title}</h2><p>Dosyanı seçtikten sonra işlem düğmesine bas.</p></div></div>

          {activeTool === "images" ? <>
            <button type="button" className="dropzone" onClick={() => imageInputRef.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); const valid = Array.from(e.dataTransfer.files).filter((f) => /\.(jpe?g|png)$/i.test(f.name)); setImageFiles((old) => [...old, ...valid]); }}><UploadCloud size={36} /><strong>JPG veya PNG görsellerini seç</strong><span>Birden fazla görsel seçebilirsin</span></button>
            <input ref={imageInputRef} type="file" accept="image/jpeg,image/png" multiple hidden onChange={handleImageChange} />
            {imageFiles.length > 0 && <div className="file-list"><div className="file-list-heading"><strong>{imageFiles.length} görsel · {formatSize(imageFiles.reduce((s, f) => s + f.size, 0))}</strong><button className="clear-button" onClick={() => setImageFiles([])}><Trash2 size={14} /> Tümünü sil</button></div>{imageFiles.map((file, index) => <div className="file-row" key={`${file.name}-${index}`}><ImageIcon size={19} /><span>{file.name}</span><small>{formatSize(file.size)}</small><button className="remove" aria-label="Görseli kaldır" onClick={() => setImageFiles((old) => old.filter((_, i) => i !== index))}><X size={16} /></button></div>)}</div>}
          </> : <>
            <button type="button" className="dropzone" onClick={() => pdfInputRef.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); selectPdfFiles(e.dataTransfer.files, activeTool !== "merge"); }}><UploadCloud size={36} /><strong>PDF dosyalarını seç veya sürükle</strong><span>{activeTool === "merge" ? "Birleştirmek için en az iki dosya seç" : "Bu işlem için bir PDF dosyası seç"}</span></button>
            <input ref={pdfInputRef} type="file" accept="application/pdf,.pdf" multiple={activeTool === "merge"} hidden onChange={(e) => { selectPdfFiles(e.target.files, activeTool !== "merge"); e.target.value = ""; }} />
            {pdfFiles.length > 0 && <div className="file-list"><div className="file-list-heading"><strong>{pdfFiles.length} PDF · {formatSize(totalBytes)}</strong><button className="clear-button" onClick={() => setPdfFiles([])}><Trash2 size={14} /> Tümünü sil</button></div>{pdfFiles.map((file, index) => <div className="file-row" key={`${file.name}-${file.size}-${index}`}><FileText size={19} /><span>{file.name}</span><small>{formatSize(file.size)}</small><button className="remove" aria-label="PDF dosyasını kaldır" onClick={() => setPdfFiles((old) => old.filter((_, i) => i !== index))}><X size={16} /></button></div>)}</div>}
          </>}

          {activeTool === "split" && <><label className="field-label" htmlFor="page-range">Sayfa aralığı</label><input className="text-field" id="page-range" value={pageRange} onChange={(e) => setPageRange(e.target.value)} placeholder="Örn. 1-3, 5, 8-10" /><p className="field-help">Virgülle sayfaları ayır, tireyle aralık belirt. Örnek: 1-3, 5</p></>}
          {activeTool === "rotate" && <><label className="field-label" htmlFor="rotation">Döndürme açısı</label><select className="text-field" id="rotation" value={rotation} onChange={(e) => setRotation(e.target.value)}><option value="90">90° saat yönünde</option><option value="180">180°</option><option value="270">270° saat yönünde</option></select></>}
          {activeTool === "number" && <><label className="field-label" htmlFor="first-number">İlk sayfa numarası</label><input className="text-field" id="first-number" type="number" min="0" value={firstNumber} onChange={(e) => setFirstNumber(e.target.value)} /></>}
          {activeTool === "delete" && <><label className="field-label" htmlFor="delete-range">Silinecek sayfalar</label><input className="text-field" id="delete-range" value={deleteRange} onChange={(e) => setDeleteRange(e.target.value)} placeholder="Örn. 1, 3-5" /><p className="field-help">Silinecek sayfaları virgül veya aralıkla belirt. En az bir sayfa kalmalı.</p></>}
          {activeTool === "reorder" && <><label className="field-label" htmlFor="page-order">Yeni sayfa sırası</label><input className="text-field" id="page-order" value={pageOrder} onChange={(e) => setPageOrder(e.target.value)} placeholder="Örn. 3, 1, 2" /><p className="field-help">Belgedeki bütün sayfaları yeni sırayla, her sayıyı bir kez yaz. PDF 3 sayfaysa örnek: 3, 1, 2.</p></>}
          {activeTool === "duplicate" && <><label className="field-label" htmlFor="duplicate-range">Çoğaltılacak sayfalar</label><input className="text-field" id="duplicate-range" value={duplicateRange} onChange={(e) => setDuplicateRange(e.target.value)} placeholder="Örn. 1, 3-4" /><p className="field-help">Seçtiğin sayfaların kopyaları mevcut sayfaların sonuna eklenir.</p></>}
          {activeTool === "blank" && <><label className="field-label" htmlFor="blank-count">Eklenecek boş sayfa sayısı</label><input className="text-field" id="blank-count" type="number" min="1" max="20" value={blankCount} onChange={(e) => setBlankCount(e.target.value)} /><p className="field-help">Boş sayfalar ilk sayfanın boyutuyla oluşturulur. Bir seferde en fazla 20 sayfa ekleyebilirsin.</p></>}
          {activeTool === "watermark" && <><label className="field-label" htmlFor="watermark">Filigran metni</label><input className="text-field" id="watermark" value={watermark} maxLength={60} onChange={(e) => setWatermark(e.target.value)} placeholder="Örn. TASLAK" /></>}
          {activeTool === "compress" && <><label className="field-label" htmlFor="compression-level">Sıkıştırma seviyesi</label><select className="text-field" id="compression-level" value={compressionLevel} onChange={(e) => setCompressionLevel(e.target.value)}><option value="strong">Güçlü — daha küçük dosya, daha düşük görüntü kalitesi</option><option value="medium">Dengeli — önerilen</option><option value="light">Hafif — daha iyi görüntü kalitesi</option></select><p className="field-help">Bu yöntem sayfaları JPEG görüntülerine dönüştürür. Metin seçimi, bağlantılar ve form alanları korunmaz.</p></>}
          {activeTool === "pdfImages" && <p className="field-help">Her PDF sayfası yüksek çözünürlüklü PNG olarak hazırlanır ve tek bir ZIP dosyasında indirilir.</p>}

          <button type="button" className="primary-button merge-button" onClick={runTool} disabled={busy || (activeTool === "images" ? imageFiles.length === 0 : pdfFiles.length === 0)}><Download size={18} />{busy ? "İşleniyor..." : activeTool === "merge" ? "PDF'leri birleştir ve indir" : activeTool === "split" ? "Seçilen sayfaları indir" : activeTool === "rotate" ? "Döndürülmüş PDF'yi indir" : activeTool === "images" ? "PDF oluştur ve indir" : activeTool === "number" ? "Numaralı PDF'yi indir" : activeTool === "delete" ? "Sayfaları sil ve indir" : activeTool === "reorder" ? "Sıralanmış PDF'yi indir" : activeTool === "duplicate" ? "Sayfaları çoğalt ve indir" : activeTool === "blank" ? "Boş sayfaları ekle ve indir" : activeTool === "compress" ? "PDF'yi sıkıştır ve indir" : activeTool === "pdfImages" ? "Sayfaları PNG olarak indir (ZIP)" : "Filigranlı PDF'yi indir"}</button>
          {message && <p className="message" role="status">{message}</p>}
          <p className="privacy"><ShieldCheck size={15} /> Dosyaların sunucuya yüklenmez; işlem tarayıcında yapılır.</p>
        </div>
      </section>

      <section className="tools" id="ogrenciler">
        <span className="eyebrow">Öğrencilere özel</span><h2>Ders çalışmak <span className="blue">daha kolay</span></h2>
        <p className="section-intro">Öğrenci araçları sıradaki geliştirme alanımız. Henüz hazır olmayan özellikleri çalışıyor gibi göstermiyoruz.</p>
        <div className="tool-grid student-grid">
          <article className="tool-card static-card"><span className="tool-card-icon"><Highlighter size={24} /></span><h3>PDF üzerine not al</h3><p>Ders notlarını vurgula ve önemli yerleri işaretle.</p><span className="coming-soon">Planlandı</span></article>
          <article className="tool-card static-card"><span className="tool-card-icon"><Sparkles size={24} /></span><h3>Ders notu yardımcısı</h3><p>Özet ve çalışma materyali hazırlama araçları.</p><span className="coming-soon">Planlandı</span></article>
          <article className="tool-card static-card"><span className="tool-card-icon"><GraduationCap size={24} /></span><h3>Öğrenci merkezi</h3><p>Ders çalışmayı kolaylaştıran araçları keşfet.</p><span className="coming-soon">Planlandı</span></article>
        </div>
      </section>

      <section className="student-section"><div className="student-icon"><GraduationCap size={42} /></div><div><h2>Eğitim materyaline erişmek zor olmamalı.</h2><p>Belge Dostu'nu özellikle öğrencilerin ihtiyaçlarını düşünerek geliştiriyoruz. Hedefimiz, kullanışlı araçları olabildiğince erişilebilir sunmak.</p></div></section>
      <footer><strong>belgedostu</strong><p>İnsanların işini kolaylaştırmak için, herkes için.</p><small>© {new Date().getFullYear()} Belge Dostu</small></footer>
    </main>
  );
}
