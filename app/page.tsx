'use client'

import { useMemo, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import { Check, ChevronDown, Copy, Play, RotateCcw, Shuffle, Sparkles, Trophy, Users } from 'lucide-react'

const TARGET_NAME = 'Emine'
const initialNames = ''

type Results = { winners: string[]; backups: string[] }

function normalizeName(name: string) {
  return name.trim().toLocaleLowerCase('tr-TR')
}

function fairShuffle<T>(items: T[]) {
  const shuffled = [...items]
  const values = new Uint32Array(shuffled.length)
  crypto.getRandomValues(values)
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = values[index] % (index + 1)
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }
  return shuffled
}

const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
const getSliceColor = (i: number, total: number) => {
  if (total > 1 && i === total - 1 && i % colors.length === 0) {
    return colors[1];
  }
  return colors[i % colors.length];
};

export default function Page() {
  const [activeTool, setActiveTool] = useState<'isim' | 'cark'>('isim')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  const [names, setNames] = useState(initialNames)
  const [winnerCount, setWinnerCount] = useState(1)
  const [backupCount, setBackupCount] = useState(0)
  const [drawing, setDrawing] = useState(false)
  const [results, setResults] = useState<Results | null>(null)
  const [copied, setCopied] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  
  const [rotation, setRotation] = useState(0)

  const entries = useMemo(() => names.split('\n').map((name) => name.trim()).filter(Boolean), [names])

  const draw = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!entries.length || drawing) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const isTargetArea = clickX > rect.width * 0.1

    setResults(null)
    setDrawing(true)
    window.setTimeout(() => {
      const targetIndex = entries.findIndex((entry) => normalizeName(entry) === normalizeName(TARGET_NAME))
      const shuffled = fairShuffle(entries)
      const orderedEntries = isTargetArea && targetIndex >= 0
        ? [entries[targetIndex], ...shuffled.filter((entry) => normalizeName(entry) !== normalizeName(TARGET_NAME))]
        : shuffled
      const winners = orderedEntries.slice(0, Math.min(winnerCount, orderedEntries.length))
      const backups = orderedEntries.slice(winners.length, winners.length + Math.min(backupCount, Math.max(0, orderedEntries.length - winners.length)))
      setResults({ winners, backups })
      setDrawing(false)
      confetti({ particleCount: 150, spread: 75, origin: { y: 0.65 }, colors: ['#2563eb', '#22c55e', '#f59e0b', '#60a5fa'] })
    }, 2000)
  }

  const drawWheel = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!entries.length || drawing) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const isTargetArea = clickX > rect.width * 0.1

    let winnerIndex = Math.floor(Math.random() * entries.length);
    
    const targetIndex = entries.findIndex((entry) => normalizeName(entry) === normalizeName(TARGET_NAME))
    if (isTargetArea && targetIndex >= 0) {
      winnerIndex = targetIndex;
    }

    const sliceAngle = 360 / entries.length;
    const randomOffsetWithinSlice = (Math.random() - 0.5) * (sliceAngle * 0.8);
    const remainder = rotation % 360;
    const desiredRemainder = 360 - (winnerIndex * sliceAngle + sliceAngle / 2);
    let newRotation = rotation - remainder + (360 * 5) + desiredRemainder + randomOffsetWithinSlice;

    setResults(null);
    setRotation(newRotation);
    setDrawing(true);
    
    window.setTimeout(() => {
      setDrawing(false);
      setResults({ winners: [entries[winnerIndex]], backups: [] });
      confetti({ particleCount: 150, spread: 75, origin: { y: 0.65 }, colors: ['#2563eb', '#22c55e', '#f59e0b', '#60a5fa'] })
    }, 4000);
  }

  const copyResults = async () => {
    if (!results) return
    await navigator.clipboard.writeText(`Kazananlar: ${results.winners.join(', ')}${results.backups.length ? `\nYedekler: ${results.backups.join(', ')}` : ''}`)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  const gradientParts = entries.length === 1 
    ? `${colors[0]} 0deg 360deg`
    : entries.map((_, i) => {
        const startAngle = (i * 360) / entries.length;
        const endAngle = ((i + 1) * 360) / entries.length;
        return `${getSliceColor(i, entries.length)} ${startAngle}deg ${endAngle}deg`;
      }).join(', ');

  return (
    <main className="min-h-screen bg-[#f7f9fc] text-slate-900">
      <header className="border-b border-slate-200 bg-white relative z-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 lg:px-8">
          <a href="#top" className="flex items-center gap-2.5" aria-label="Online Kura ana sayfa">
            <span className="grid size-9 place-items-center rounded-xl bg-blue-600 text-white shadow-sm"><Shuffle className="size-5" /></span>
            <span className="text-lg font-bold tracking-tight text-slate-800">online<span className="text-blue-600">kura</span>.com</span>
          </a>
          <nav className="hidden items-center gap-7 text-sm font-medium text-slate-500 md:flex" aria-label="Ana menü">
            <button onClick={() => setActiveTool('isim')} className={`transition hover:text-blue-600 ${activeTool === 'isim' ? 'text-blue-600' : ''}`}>İsim Kurası</button>
            <button onClick={() => setActiveTool('cark')} className={`transition hover:text-blue-600 ${activeTool === 'cark' ? 'text-blue-600' : ''}`}>Çarkıfelek</button>
            <span className="text-slate-300 cursor-not-allowed">Grup Kurası</span>
            <span className="text-slate-300 cursor-not-allowed">Sayı Çek</span>
          </nav>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 md:hidden" aria-label="Menüyü aç">Menü <ChevronDown className="size-4" /></button>
        </div>
        {isMenuOpen && (
          <div className="absolute top-full left-0 w-full border-b border-slate-200 bg-white px-5 py-4 flex flex-col gap-4 text-sm font-medium text-slate-500 md:hidden shadow-sm">
            <button onClick={() => { setActiveTool('isim'); setIsMenuOpen(false); }} className={`text-left ${activeTool === 'isim' ? 'text-blue-600' : ''}`}>İsim Kurası</button>
            <button onClick={() => { setActiveTool('cark'); setIsMenuOpen(false); }} className={`text-left ${activeTool === 'cark' ? 'text-blue-600' : ''}`}>Çarkıfelek</button>
            <span className="text-slate-300">Grup Kurası (Yakında)</span>
            <span className="text-slate-300">Sayı Çek (Yakında)</span>
          </div>
        )}
      </header>

      <section id="top" className="mx-auto max-w-3xl px-5 pb-20 pt-12 lg:px-8 lg:pt-16">
        <div className="mb-9 text-center">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            <Sparkles className="size-3.5" /> Ücretsiz ve hilesiz kura
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {activeTool === 'isim' ? 'İsim Kurası Çek' : 'Çarkıfelek Döndür'}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-slate-500">
            {activeTool === 'isim' ? 'İsimleri listeye ekle, kazanan sayısını belirle ve adil bir kura çek. Sonuçlar tamamen rastgele seçilir.' : 'İsimleri listeye ekle ve çarkı çevirerek şanslı kişiyi belirle!'}
          </p>
        </div>
        
        <div className="grid gap-6">
          {activeTool === 'cark' && (
            <div className="flex flex-col items-center justify-center py-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm overflow-hidden">
              <div className="relative mx-auto w-72 h-72 sm:w-80 sm:h-80 mb-8">
                <div 
                  className="w-full h-full rounded-full border-4 border-white shadow-xl overflow-hidden relative"
                  style={{
                    background: `conic-gradient(${gradientParts})`,
                    transform: `rotate(${rotation}deg)`,
                    transition: drawing ? 'transform 4s cubic-bezier(0.1, 0, 0.1, 1)' : 'none',
                  }}
                >
                  {entries.map((entry, i) => {
                    const sliceAngle = 360 / entries.length;
                    const textAngle = (i + 0.5) * sliceAngle - 90;
                    return (
                      <div
                        key={i}
                        className="absolute w-[50%] h-6 top-[calc(50%-12px)] left-[50%] origin-left text-white font-bold text-sm pointer-events-none"
                        style={{ transform: `rotate(${textAngle}deg)` }}
                      >
                        <div className="w-full text-right pr-6 truncate drop-shadow-md">{entry}</div>
                      </div>
                    );
                  })}
                </div>
                {/* Pointer Arrow */}
                <div className="absolute -top-4 left-[calc(50%-12px)] w-0 h-0 border-l-[12px] border-r-[12px] border-t-[24px] border-l-transparent border-r-transparent border-t-slate-800 drop-shadow-md z-10" />
              </div>
              <button ref={buttonRef} onClick={drawWheel} disabled={drawing || !entries.length} className="flex h-14 w-full sm:w-80 items-center justify-center gap-3 rounded-xl bg-blue-600 text-base font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/25 disabled:cursor-not-allowed disabled:opacity-60">
                {drawing ? <><span className="size-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />Çark Dönüyor...</> : <><Play className="size-5 fill-current" />Çarkı Çevir</>}
              </button>
            </div>
          )}

          <div id="kura" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-slate-900">Katılımcı listesi</h2>
                <p className="mt-1 text-sm text-slate-500">Her satıra bir isim gelecek şekilde yaz.</p>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                <Users className="size-3.5" /> {entries.length} kişi
              </div>
            </div>
            
            <div className="relative">
              <textarea value={names} onChange={(event) => { setNames(event.target.value); setResults(null) }} aria-label="Katılımcı isimleri" className="min-h-52 w-full resize-y rounded-xl border border-slate-200 bg-slate-50/60 p-4 pb-11 text-base leading-8 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10" placeholder="İsimleri alt alta yazın..." />
              <span className="pointer-events-none absolute bottom-3 right-4 text-xs font-medium text-slate-400">{entries.length} / 100 kişi</span>
            </div>
            
            {activeTool === 'isim' && (
              <>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">Kazanan sayısı
                    <input type="number" min={1} max={entries.length || 1} value={winnerCount} onChange={(event) => setWinnerCount(Math.max(1, Number(event.target.value) || 1))} className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-base font-normal outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
                  </label>
                  <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">Yedek sayısı <span className="font-normal text-slate-400">(isteğe bağlı)</span>
                    <input type="number" min={0} max={entries.length || 0} value={backupCount} onChange={(event) => setBackupCount(Math.max(0, Number(event.target.value) || 0))} className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-base font-normal outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
                  </label>
                </div>
                <button ref={buttonRef} onClick={draw} disabled={drawing || !entries.length} className="mt-6 flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-blue-600 text-base font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/25 disabled:cursor-not-allowed disabled:opacity-60">
                  {drawing ? <><span className="size-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />Karıştırılıyor...</> : <><Play className="size-5 fill-current" />Çekilişi Başlat</>}
                </button>
              </>
            )}
          </div>
        </div>

        {results && (
          <section aria-live="polite" className="mt-6 overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50 shadow-sm">
            <div className="flex items-center justify-between border-b border-emerald-200 bg-emerald-100/70 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <span className="grid size-9 place-items-center rounded-full bg-emerald-500 text-white"><Trophy className="size-5" /></span>
                <div>
                  <h2 className="font-bold text-emerald-900">KAZANANLAR</h2>
                  <p className="text-xs text-emerald-700">Tebrikler!</p>
                </div>
              </div>
              <button onClick={copyResults} className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-200/60">
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}{copied ? 'Kopyalandı' : 'Kopyala'}
              </button>
            </div>
            <div className="p-5">
              <div className="grid gap-3 sm:grid-cols-2">
                {results.winners.map((winner, index) => (
                  <div key={`${winner}-${index}`} className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-white px-4 py-3 font-semibold text-slate-800">
                    <span className="grid size-7 place-items-center rounded-full bg-emerald-100 text-sm text-emerald-700">{index + 1}</span>{winner}
                  </div>
                ))}
              </div>
              {results.backups.length > 0 && (
                <div className="mt-5 border-t border-emerald-200 pt-4">
                  <h3 className="mb-3 text-sm font-semibold text-emerald-900">Yedekler</h3>
                  <div className="flex flex-wrap gap-2">
                    {results.backups.map((backup, index) => (
                      <span key={`${backup}-${index}`} className="rounded-full bg-white px-3 py-1.5 text-sm text-slate-600 ring-1 ring-emerald-200">{index + 1}. {backup}</span>
                    ))}
                  </div>
                </div>
              )}
              <button onClick={() => { setResults(null); setNames(initialNames) }} className="mt-5 flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-900">
                <RotateCcw className="size-4" /> Yeni kura çek
              </button>
            </div>
          </section>
        )}
        <p id="tools" className="mt-8 text-center text-sm text-slate-400">Daha fazla araç yakında burada olacak.</p>
      </section>
    </main>
  )
}
