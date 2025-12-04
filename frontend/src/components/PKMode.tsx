import React, { useMemo, useState } from 'react'
import { useAppStore, useTranslation } from '../store/useAppStore'
import { QuestionCard } from './QuestionCard'
import { api, Question } from '../services/api'
import { Shuffle, Search, ThumbsUp, ThumbsDown, Gauge } from 'lucide-react'

interface PKModeProps {
  onClose: () => void
}

export const PKMode: React.FC<PKModeProps> = ({ onClose }) => {
  const { history, addLog } = useAppStore()
  const { t } = useTranslation()
  const [mode, setMode] = useState<'keyword'|'popular'|'random'>('random')
  const [keyword, setKeyword] = useState('')
  const [userId] = useState(() => {
    const k = 'pk-user-id';
    const v = localStorage.getItem(k) || Math.random().toString(36).slice(2)
    localStorage.setItem(k, v)
    return v
  })
  const allQuestions: Question[] = useMemo(() => history.flatMap(h => h.questions), [history])
  const [pair, setPair] = useState<{ left: Question; right: Question } | null>(null)

  const stopwords = new Set(['the','and','for','with','from','into','this','that','have','has','are','was','were','will','shall','of','in','on','at','to','by','or','an','a','as'])
  const popular = useMemo(() => {
    const tokens: Record<string, number> = {}
    history.forEach(h => {
      const texts = [h.paperTitle, h.subject, ...(h.keywords || []), ...h.questions.flatMap((q: any) => [q.scenario, q.context, q.explanation])]
      texts.forEach(txt => {
        if (!txt) return
        String(txt).toLowerCase().split(/[^a-z0-9]+/).forEach(w => {
          if (w && w.length >= 3 && !stopwords.has(w)) tokens[w] = (tokens[w] || 0) + 1
        })
      })
    })
    return Object.entries(tokens).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([w])=>w)
  }, [history])

  const startPk = async () => {
    try {
      const resp = await api.pkStart(allQuestions, mode, keyword)
      setPair(resp)
      addLog({ type: 'info', message: 'PK started', details: { mode, keyword, ids: [resp.left.id, resp.right.id] } })
    } catch (e) {
      addLog({ type: 'error', message: 'PK start failed', details: e })
      alert('PK 初始化失败')
    }
  }

  const rate = async (side: 'left'|'right', kind: 'goodbad'|'hardeasy', value: 'good'|'bad'|'hard'|'easy') => {
    if (!pair) return
    const qidLeft = pair.left.id
    const qidRight = pair.right.id
    await api.pkRate({ userId, qidLeft: side==='left'?qidLeft:qidRight, qidRight: side==='left'?qidRight:qidLeft, ratingType: kind, value })
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">题目 PK 模式</h3>
        <button onClick={onClose} className="text-sm px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-100">关闭</button>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 items-start">
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
          <button onClick={()=>setMode('keyword')} className={`px-3 py-1.5 rounded ${mode==='keyword'?'bg-white shadow':'hover:opacity-80'}`}>关键词</button>
          <button onClick={()=>setMode('popular')} className={`px-3 py-1.5 rounded ${mode==='popular'?'bg-white shadow':'hover:opacity-80'}`}>高频</button>
          <button onClick={()=>setMode('random')} className={`px-3 py-1.5 rounded ${mode==='random'?'bg-white shadow':'hover:opacity-80'}`}>随机</button>
        </div>
        {mode!=='random' && (
          <div className="flex-1 flex items-center gap-2">
            <input value={keyword} onChange={(e)=>setKeyword(e.target.value)} placeholder="输入关键词..." className="flex-1 px-3 py-2 rounded border" />
            <button onClick={startPk} className="px-3 py-2 rounded bg-blue-600 text-white flex items-center gap-1"><Search className="w-4 h-4"/>开始PK</button>
          </div>
        )}
        {mode==='random' && (
          <button onClick={startPk} className="px-3 py-2 rounded bg-blue-600 text-white flex items-center gap-1"><Shuffle className="w-4 h-4"/>随机PK</button>
        )}
      </div>

      {mode==='popular' && (
        <div className="flex flex-wrap gap-2">
          {popular.map(w => (
            <button key={w} onClick={()=>{setKeyword(w); startPk();}} className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100">{w}</button>
          ))}
        </div>
      )}

      {pair && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-3">
            <QuestionCard question={pair.left} index={1} requestedMode={'text'} />
            <div className="flex items-center gap-2">
              <button onClick={()=>{rate('left','goodbad','good'); rate('right','goodbad','bad')}} className="px-3 py-1.5 rounded bg-green-600 text-white flex items-center gap-1"><ThumbsUp className="w-4 h-4"/>Good</button>
              <button onClick={()=>{rate('left','hardeasy','hard'); rate('right','hardeasy','easy')}} className="px-3 py-1.5 rounded bg-orange-600 text-white flex items-center gap-1"><Gauge className="w-4 h-4"/>Hard</button>
            </div>
          </div>
          <div className="space-y-3">
            <QuestionCard question={pair.right} index={2} requestedMode={'text'} />
            <div className="flex items-center gap-2">
              <button onClick={()=>{rate('right','goodbad','good'); rate('left','goodbad','bad')}} className="px-3 py-1.5 rounded bg-green-600 text-white flex items-center gap-1"><ThumbsUp className="w-4 h-4"/>Good</button>
              <button onClick={()=>{rate('right','hardeasy','hard'); rate('left','hardeasy','easy')}} className="px-3 py-1.5 rounded bg-orange-600 text-white flex items-center gap-1"><Gauge className="w-4 h-4"/>Hard</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
