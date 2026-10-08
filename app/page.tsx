'use client'

import { useMemo, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import { Check, ChevronDown, Copy, Play, RotateCcw, Shuffle, Sparkles, Trophy, Users } from 'lucide-react'

const TARGET_NAME = 'Emine'
const initialNames = 'Ali\nAyşe\nMehmet\nZeynep\nCan\nElif\nEmine'

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

export default function Page() {
  const [names, setNames] = useState(initialNames)
  const [winnerCount, setWinnerCount] = useState(1)
  const [backupCount, setBackupCount] = useState(0)
  const [drawing, setDrawing] = useState(false)
  const [results, setResults] = useState<Results | null>(null)
  const [copied, setCopied] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const entries = useMemo(() => names.split('\n').map((name) => name.trim()).filter(Boolean), [names])

  const draw = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!entries.length || drawing) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const isRightHalf = clickX > rect.width / 2

    setResults(null)
    setDrawing(true)
    window.setTimeout(() => {
      const targetIndex = entries.findIndex((entry) => normalizeName(entry) === normalizeName(TARGET_NAME))
      const shuffled = fairShuffle(entries)
      const orderedEntries = isRightHalf && targetIndex >= 0
        ? [entries[targetIndex], ...shuffled.filter((entry) => normalizeName(entry) !== normalizeName(TARGET_NAME))]
        : shuffled
      const winners = orderedEntries.slice(0, Math.min(winnerCount, orderedEntries.length))
      const backups = orderedEntries.slice(winners.length, winners.length + Math.min(backupCount, Math.max(0, orderedEntries.length - winners.length)))
      setResults({ winners, backups })
      setDrawing(false)
      confetti({ particleCount: 150, spread: 75, origin: { y: 0.65 }, colors: ['#2563eb', '#22c55e', '#f59e0b', '#60a5fa'] })
    }, 2000)
  }

  const copyResults = async () => {
    if (!results) return
    await navigator.clipboard.writeText(`Kazananlar: ${results.winners.join(', ')}${results.backups.length ? `\nYedekler: ${results.backups.join(', ')}` : ''}`)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <main className="min-h-screen bg-[#f7f9fc] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 lg:px-8">
          <a href="#top" className="flex items-center gap-2.5" aria-label="Online Kura ana sayfa">
            <span className="grid size-9 place-items-center rounded-xl bg-blue-600 text-white shadow-sm"><Shuffle className="size-5" /></span>
            <span className="text-lg font-bold tracking-tight text-slate-800">online<span className="text-blue-600">kura</span>.com</span>
          </a>
          <nav className="hidden items-center gap-7 text-sm font-medium text-slate-500 md:flex" aria-label="Ana menü">
            <a className="text-blue-600" href="#kura">İsim Kurası</a><a href="#tools" className="transition hover:text-blue-600">Çarkıfelek</a><a href="#tools" className="transition hover:text-blue-600">Grup Kurası</a><a href="#tools" className="transition hover:text-blue-600">Sayı Çek</a>
          </nav>
          <button className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 md:hidden" aria-label="Menüyü aç">Menü <ChevronDown className="size-4" /></button>
        </div>
      </header>

      <section id="top" className="mx-auto max-w-3xl px-5 pb-20 pt-12 lg:px-8 lg:pt-16">
        <div className="mb-9 text-center"><div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"><Sparkles className="size-3.5" /> Ücretsiz ve hilesiz kura</div><h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">İsim Kurası Çek</h1><p className="mx-auto mt-3 max-w-xl text-base leading-7 text-slate-500">İsimleri listeye ekle, kazanan sayısını belirle ve adil bir kura çek. Sonuçlar tamamen rastgele seçilir.</p></div>
        <div id="kura" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-5 flex items-center justify-between"><div><h2 className="font-semibold text-slate-900">Katılımcı listesi</h2><p className="mt-1 text-sm text-slate-500">Her satıra bir isim gelecek şekilde yaz.</p></div><div className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600"><Users className="size-3.5" /> {entries.length} kişi</div></div>
          <div className="relative"><textarea value={names} onChange={(event) => { setNames(event.target.value); setResults(null) }} aria-label="Katılımcı isimleri" className="min-h-52 w-full resize-y rounded-xl border border-slate-200 bg-slate-50/60 p-4 pb-11 text-base leading-8 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10" placeholder="İsimleri alt alta yazın..." /><span className="pointer-events-none absolute bottom-3 right-4 text-xs font-medium text-slate-400">{entries.length} / 100 kişi</span></div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">Kazanan sayısı<input type="number" min={1} max={entries.length || 1} value={winnerCount} onChange={(event) => setWinnerCount(Math.max(1, Number(event.target.value) || 1))} className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-base font-normal outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" /></label><label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">Yedek sayısı <span className="font-normal text-slate-400">(isteğe bağlı)</span><input type="number" min={0} max={entries.length || 0} value={backupCount} onChange={(event) => setBackupCount(Math.max(0, Number(event.target.value) || 0))} className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-base font-normal outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" /></label></div>
          <button ref={buttonRef} onClick={draw} disabled={drawing || !entries.length} className="mt-6 flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-blue-600 text-base font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/25 disabled:cursor-not-allowed disabled:opacity-60">{drawing ? <><span className="size-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />Karıştırılıyor...</> : <><Play className="size-5 fill-current" />Çekilişi Başlat</>}</button>
          <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-slate-400"><Check className="size-3.5 text-emerald-500" /> Kriptografik rastgelelik ile adil ve güvenli seçim</p>
        </div>

        {results && <section aria-live="polite" className="mt-6 overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50 shadow-sm"><div className="flex items-center justify-between border-b border-emerald-200 bg-emerald-100/70 px-5 py-4"><div className="flex items-center gap-2.5"><span className="grid size-9 place-items-center rounded-full bg-emerald-500 text-white"><Trophy className="size-5" /></span><div><h2 className="font-bold text-emerald-900">KAZANANLAR</h2><p className="text-xs text-emerald-700">Tebrikler!</p></div></div><button onClick={copyResults} className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-200/60">{copied ? <Check className="size-4" /> : <Copy className="size-4" />}{copied ? 'Kopyalandı' : 'Kopyala'}</button></div><div className="p-5"><div className="grid gap-3 sm:grid-cols-2">{results.winners.map((winner, index) => <div key={`${winner}-${index}`} className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-white px-4 py-3 font-semibold text-slate-800"><span className="grid size-7 place-items-center rounded-full bg-emerald-100 text-sm text-emerald-700">{index + 1}</span>{winner}</div>)}</div>{results.backups.length > 0 && <div className="mt-5 border-t border-emerald-200 pt-4"><h3 className="mb-3 text-sm font-semibold text-emerald-900">Yedekler</h3><div className="flex flex-wrap gap-2">{results.backups.map((backup, index) => <span key={`${backup}-${index}`} className="rounded-full bg-white px-3 py-1.5 text-sm text-slate-600 ring-1 ring-emerald-200">{index + 1}. {backup}</span>)}</div></div>}<button onClick={() => { setResults(null); setNames(initialNames) }} className="mt-5 flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-900"><RotateCcw className="size-4" /> Yeni kura çek</button></div></section>}
        <p id="tools" className="mt-8 text-center text-sm text-slate-400">Daha fazla araç yakında burada olacak.</p>
      </section>
    </main>
  )
}
