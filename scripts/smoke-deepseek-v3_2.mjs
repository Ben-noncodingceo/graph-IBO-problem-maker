import fetch from 'node-fetch'

const url = 'https://graph-ibo-problem-maker.peungsun.workers.dev/api/generate_questions'

const body = {
  paper: {
    title: 'Genome-wide association of gene expression profiles',
    link: 'https://example.com/paper',
    snippet: 'This study analyzes gene expression across conditions to identify regulatory elements.'
  },
  subject: 'Genetics',
  mode: 'text',
  language: 'zh'
}

const res = await fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-model-type': 'deepseek_v3_2'
  },
  body: JSON.stringify(body)
})

if (!res.ok) {
  const text = await res.text()
  console.log('SMOKE_TEST_FAILED', res.status, text)
  process.exit(0)
}

const data = await res.json()
if (Array.isArray(data.questions) && data.questions.length >= 1) {
  console.log('SMOKE_TEST_PASSED', data.questions.length)
} else {
  console.log('SMOKE_TEST_FAILED_BAD_PAYLOAD')
}
