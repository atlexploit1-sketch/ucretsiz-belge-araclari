
"use client";

import { useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";
import {
  FileText,
  Files,
  UploadCloud,
  ShieldCheck,
  Heart,
  GraduationCap,
  ArrowDownToLine,
  X,
  Check,
  Trash2,
  Scissors,
  RotateCw,
  Minimize2,
  Image as ImageIcon,
  FileType,
  Highlighter,
  Sparkles,
  LockKeyhole,
} from "lucide-react";

type ToolCardProps = {
  icon: typeof Files;
  title: string;
  description: string;
  available?: boolean;
};

function ToolCard({
  icon: Icon,
  title,
  description,
  available = false,
}: ToolCardProps) {
  return (
    <article>
      <Icon aria-hidden="true" />
      <h3>{title}</h3>
      <p>{description}</p>
      <span className={available ? "available" : undefined}>
        {available ? (
          <>
            <Check size={14} /> Kullanılabilir
          </>
        ) : (
          "Yakında"
        )}
      </span>
    </article>
  );
}

export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  function addFiles(selected: FileList | null) {
    if (!selected) return;

    const chosen = Array.from(selected);
    const pdfs = chosen.filter(
      (file) =>
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf")
    );

    setFiles((previous) => [...previous, ...pdfs]);

    if (pdfs.length !== chosen.length) {
      setMessage("Bazı dosyalar eklenmedi. Yalnızca PDF dosyaları seçebilirsin.");
    } else if (pdfs.length > 0) {
      setMessage("");
    }
  }

  function removeFile(index: number) {
    setFiles((previous) => previous.filter((_, i) => i !== index));
    setMessage("");
  }

  async function mergePdfs() {
    if (files.length < 2) {
      setMessage("Birleştirmek için en az iki PDF dosyası seçmelisin.");
      return;
    }

    setBusy(true);
    setMessage("");

    try {
      const output = await PDFDocument.create();

      for (const file of files) {
        const fileBytes = await file.arrayBuffer();
        const pdf = await PDFDocument.load(fileBytes);
        const pages = await output.copyPages(
          pdf,
          pdf.getPageIndices()
        );

        pages.forEach((page) => output.addPage(page));
      }

      const bytes = await output.save();
      const safeBytes = new Uint8Array(bytes);
      const blob = new Blob(
        [safeBytes.buffer as ArrayBuffer],
        { type: "application/pdf" }
      );

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "birlesik-belge.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.setTimeout(() => URL.revokeObjectURL(url), 1000);

      setMessage(
        "PDF dosyaların başarıyla birleştirildi. İndirilenler klasörünü kontrol et."
      );
    } catch (error) {
      console.error("PDF birleştirme hatası:", error);
      setMessage(
        "Bir PDF okunamadı. Dosyanın sağlam ve parola korumasız olduğundan emin ol."
      );
    } finally {
      setBusy(false);
    }
  }

  const pdfTools: ToolCardProps[] = [
    {
      icon: Files,
      title: "PDF birleştir",
      description: "Birden fazla PDF dosyasını tek belgede birleştir.",
      available: true,
    },
    {
      icon: Scissors,
      title: "PDF böl",
      description: "Sayfaları ayır ve ihtiyacın olan bölümleri çıkar.",
    },
    {
      icon: RotateCw,
      title: "PDF sayfalarını döndür",
      description: "Yanlış yöndeki sayfaları düzelt.",
    },
    {
      icon: Minimize2,
      title: "PDF sıkıştır",
      description: "Dosya boyutunu küçültmeye yardımcı ol.",
    },
    {
      icon: ImageIcon,
      title: "PDF'den görsel çıkar",
      description: "PDF sayfalarını görsel olarak dışa aktar.",
    },
    {
      icon: LockKeyhole,
      title: "PDF koruması",
      description: "Belgeler için parola koruma araçları.",
    },
  ];

  const conversionTools: ToolCardProps[] = [
    {
      icon: FileType,
      title: "Word → PDF",
      description: "Word belgelerini PDF biçimine dönüştür.",
    },
    {
      icon: ImageIcon,
      title: "Görsel → PDF",
      description: "JPG ve PNG görsellerinden PDF oluştur.",
    },
    {
      icon: FileText,
      title: "PDF → Word",
      description: "PDF içeriğini düzenlenebilir belgeye dönüştür.",
    },
  ];

  const studentTools: ToolCardProps[] = [
    {
      icon: Highlighter,
      title: "PDF üzerine not al",
      description: "Ders notlarını vurgula ve önemli yerleri işaretle.",
    },
    {
      icon: Sparkles,
      title: "Ders notu yardımcısı",
      description: "Özet ve çalışma materyali hazırlama araçları.",
    },
    {
      icon: GraduationCap,
      title: "Öğrenci merkezi",
      description: "Ders çalışmayı kolaylaştıran araçları keşfet.",
    },
  ];

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#" aria-label="Belge Dostu ana sayfa">
          <span className="brand-icon">
            <FileText size={25} />
          </span>
          <span>
            belge<span className="blue">dostu</span>
            <small>Ücretsiz belge araçları</small>
          </span>
        </a>

        <nav className="nav-links" aria-label="Ana menü">
          <a href="#araclar">Araçlar</a>
          <a href="#donustur">Dönüştür</a>
          <a href="#ogrenciler">Öğrenciler için</a>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">✦ Herkes için ücretsiz</span>

          <h1>
            Belgelerin hazır.
            <br />
            <span className="blue">İşin kolay.</span>
          </h1>

          <p>
            PDF belgelerini kolayca düzenle. Öğrenciler ve
            herkes için erişilebilir, sade ve gizliliğe önem
            veren belge araçları geliştiriyoruz.
          </p>

          <a className="primary-button" href="#birlestir">
            PDF birleştirmeye başla ↓
          </a>

          <div className="trust">
            <span>
              <ShieldCheck size={17} />
              Dosyaların cihazında işlenir
            </span>
            <span>
              <Heart size={17} />
              Ücretsiz kullanım hedefi
            </span>
          </div>
        </div>

        <section className="upload-card" id="birlestir">
          <div className="card-heading">
            <span className="card-icon">
              <Files size={23} />
            </span>
            <div>
              <h2>PDF birleştir</h2>
              <p>Birden fazla PDF'yi tek dosyada topla.</p>
            </div>
          </div>

          <button
            type="button"
            className="dropzone"
            onClick={() => inputRef.current?.click()}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              addFiles(event.dataTransfer.files);
            }}
            aria-label="PDF dosyalarını seç veya buraya sürükle"
          >
            <UploadCloud size={38} />
            <strong>PDF dosyalarını seç</strong>
            <span>veya dosyaları bu alana sürükle</span>
          </button>

          <input
            ref={inputRef}
            type="file"
            accept=".pdf,application/pdf"
            multiple
            hidden
            onChange={(event) => {
              addFiles(event.target.files);
              event.target.value = "";
            }}
          />

          {files.length > 0 && (
            <div className="file-list">
              <div className="file-list-heading">
                <strong>{files.length} dosya seçildi</strong>
                <button
                  type="button"
                  className="clear-button"
                  onClick={() => {
                    setFiles([]);
                    setMessage("");
                  }}
                >
                  <Trash2 size={14} /> Tümünü sil
                </button>
              </div>

              {files.map((file, index) => (
                <div
                  className="file-row"
                  key={`${file.name}-${file.size}-${index}`}
                >
                  <FileText size={20} />
                  <span className="file-name">{file.name}</span>
                  <small>
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </small>
                  <button
                    type="button"
                    className="remove"
                    aria-label={`${file.name} dosyasını kaldır`}
                    onClick={() => removeFile(index)}
                  >
                    <X size={17} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {files.length > 0 && (
            <button
              type="button"
              className="primary-button merge-button"
              disabled={busy}
              onClick={mergePdfs}
            >
              <ArrowDownToLine size={18} />
              {busy ? "Birleştiriliyor..." : "PDF'leri birleştir ve indir"}
            </button>
          )}

          {message && (
            <p className="message" role="status">
              {message}
            </p>
          )}

          <p className="privacy">
            <ShieldCheck size={15} />
            Birleştirme işlemi tarayıcında gerçekleşir.
          </p>
        </section>
      </section>

      <section className="tools" id="araclar">
        <span className="eyebrow">PDF işlemleri</span>
        <h2>
          Belge işlerin için <span className="blue">tek adres</span>
        </h2>
        <p>
          Günlük belge işlemlerini kolaylaştıran araçlar.
          Kullanıma hazır olanları hemen deneyebilirsin.
        </p>

        <div className="tool-grid">
          {pdfTools.map((tool) => (
            <ToolCard key={tool.title} {...tool} />
          ))}
        </div>
      </section>

      <section className="tools" id="donustur">
        <span className="eyebrow">Dosya dönüştürme</span>
        <h2>
          Dosyalarını <span className="blue">dönüştür</span>
        </h2>
        <p>
          Farklı belge biçimleri arasında geçiş için planlanan araçlar.
        </p>

        <div className="tool-grid">
          {conversionTools.map((tool) => (
            <ToolCard key={tool.title} {...tool} />
          ))}
        </div>
      </section>

      <section className="tools" id="ogrenciler">
        <span className="eyebrow">Öğrencilere özel</span>
        <h2>
          Ders çalışmak <span className="blue">daha kolay</span>
        </h2>
        <p>
          Ders materyallerini düzenlemeye ve öğrenme sürecini
          kolaylaştırmaya yardımcı olacak araçlar.
        </p>

        <div className="tool-grid">
          {studentTools.map((tool) => (
            <ToolCard key={tool.title} {...tool} />
          ))}
        </div>
      </section>

      <section className="student-section">
        <div className="student-icon">
          <GraduationCap size={42} />
        </div>
        <div>
          <h2>Eğitim materyaline erişmek zor olmamalı.</h2>
          <p>
            Temel belge araçlarının herkes tarafından kullanılabilmesini
            istiyoruz. Belge Dostu'nu özellikle öğrencilerin ihtiyaçlarını
            düşünerek geliştiriyoruz. Amacımız, kullanışlı araçları
            olabildiğince erişilebilir sunmak.
          </p>
        </div>
      </section>

      <footer>
        <strong>belgedostu</strong>
        <p>İnsanların işini kolaylaştırmak için, herkes için.</p>
        <small>© {new Date().getFullYear()} Belge Dostu</small>
      </footer>
    </main>
  );
}
