import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

export interface AIAnalysisResult {
  title: string
  summary: string
  keyPoints: string[]
  flashcards: { front: string; back: string }[]
  questions: {
    question: string
    options: string[]
    correctIndex: number
    explanation: string
  }[]
}

export async function analyzeContent(text: string, filename: string): Promise<AIAnalysisResult> {
  const truncated = text.slice(0, 8000)

  const prompt = `Sen bir eğitim asistanısın. Aşağıdaki eğitim içeriğini analiz et ve Türkçe olarak yanıt ver.

İçerik dosya adı: "${filename}"
İçerik metni:
---
${truncated}
---

Lütfen JSON formatında şu bilgileri döndür (başka hiçbir şey yazma, sadece JSON):
{
  "title": "İçerik için uygun bir başlık (kısa ve açıklayıcı)",
  "summary": "2-3 paragraf halinde açık ve anlaşılır özet",
  "keyPoints": ["Önemli kavram 1", "Önemli kavram 2", "Önemli kavram 3", "Önemli kavram 4", "Önemli kavram 5"],
  "flashcards": [
    {"front": "Soru veya kavram", "back": "Cevap veya açıklama"},
    {"front": "Soru veya kavram", "back": "Cevap veya açıklama"},
    {"front": "Soru veya kavram", "back": "Cevap veya açıklama"},
    {"front": "Soru veya kavram", "back": "Cevap veya açıklama"},
    {"front": "Soru veya kavram", "back": "Cevap veya açıklama"}
  ],
  "questions": [
    {
      "question": "Çoktan seçmeli soru metni?",
      "options": ["A şıkkı", "B şıkkı", "C şıkkı", "D şıkkı"],
      "correctIndex": 0,
      "explanation": "Neden bu cevap doğru?"
    },
    {
      "question": "Soru 2?",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 1,
      "explanation": "Açıklama"
    },
    {
      "question": "Soru 3?",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 2,
      "explanation": "Açıklama"
    },
    {
      "question": "Soru 4?",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0,
      "explanation": "Açıklama"
    },
    {
      "question": "Soru 5?",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 3,
      "explanation": "Açıklama"
    }
  ]
}`

  const message = await client.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  })

  const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

  const jsonMatch = responseText.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('AI yanıtı JSON formatında değil')

  return JSON.parse(jsonMatch[0]) as AIAnalysisResult
}

export async function generateDemoContent(): Promise<AIAnalysisResult> {
  return {
    title: 'Yapay Zeka ve Makine Öğrenmesi Temelleri',
    summary:
      'Yapay zeka, bilgisayar sistemlerinin insan benzeri görevleri yerine getirmesini sağlayan bir teknoloji alanıdır. Makine öğrenmesi, verilerden otomatik olarak öğrenme yeteneği kazanan algoritmaları kapsar.\n\nDerin öğrenme ise sinir ağları kullanarak karmaşık örüntüleri tanımlamayı mümkün kılar. Bu teknolojiler günümüzde tıptan finansa, eğitimden güvenliğe kadar pek çok alanda kullanılmaktadır.',
    keyPoints: [
      'Yapay zeka, insan zekasını taklit eden bilgisayar sistemleridir',
      'Makine öğrenmesi verilerden öğrenen algoritmalar kullanır',
      'Derin öğrenme sinir ağlarına dayanır',
      'Doğal dil işleme metinleri anlamayı sağlar',
      'Görüntü tanıma görsel verileri analiz eder',
    ],
    flashcards: [
      { front: 'Yapay Zeka nedir?', back: 'İnsan zekasını taklit eden bilgisayar sistemleri' },
      { front: 'Makine Öğrenmesi nedir?', back: 'Verilerden otomatik öğrenen algoritmalar' },
      { front: 'Sinir Ağı nedir?', back: 'İnsan beyninden esinlenerek oluşturulan hesaplama modelleri' },
      { front: 'NLP nedir?', back: 'Natural Language Processing - Doğal Dil İşleme' },
      { front: 'Supervised Learning nedir?', back: 'Etiketli verilerle eğitilen makine öğrenmesi türü' },
    ],
    questions: [
      {
        question: 'Makine öğrenmesinin temel amacı nedir?',
        options: [
          'Verilerden otomatik öğrenmek',
          'Sadece hesaplama yapmak',
          'İnternet bağlantısı sağlamak',
          'Dosya depolamak',
        ],
        correctIndex: 0,
        explanation: 'Makine öğrenmesi, algoritmaların verilerden otomatik olarak öğrenmesini sağlar.',
      },
      {
        question: 'Derin öğrenme hangi yapıya dayanır?',
        options: ['Veritabanları', 'Sinir ağları', 'Elektronik tablolar', 'Web sayfaları'],
        correctIndex: 1,
        explanation: 'Derin öğrenme, insan beyninden esinlenen yapay sinir ağlarını kullanır.',
      },
      {
        question: 'NLP neyin kısaltmasıdır?',
        options: [
          'Network Link Protocol',
          'Natural Learning Process',
          'Natural Language Processing',
          'Neural Layer Program',
        ],
        correctIndex: 2,
        explanation: 'NLP, Natural Language Processing yani Doğal Dil İşleme anlamına gelir.',
      },
      {
        question: 'Supervised learning\'de veriler nasıl olmalıdır?',
        options: ['Etiketlenmemiş', 'Etiketlenmiş', 'Şifreli', 'Rastgele'],
        correctIndex: 1,
        explanation: 'Supervised learning, doğru cevaplarla etiketlenmiş verilerle eğitim yapar.',
      },
      {
        question: 'Hangi alan yapay zeka kullanmaz?',
        options: ['Tıp teşhisi', 'Finans analizi', 'Kalem üretimi', 'Görüntü tanıma'],
        correctIndex: 2,
        explanation: 'Kalem üretimi mekanik bir süreçtir ve yapay zeka gerektirmez.',
      },
    ],
  }
}
