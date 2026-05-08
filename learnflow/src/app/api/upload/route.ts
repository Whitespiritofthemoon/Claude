import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { analyzeContent, generateDemoContent } from '@/lib/ai'
import { addPoints, POINTS } from '@/lib/gamification'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const useDemoContent = formData.get('demo') === 'true'

    let rawText = ''
    let fileUrl = null
    let fileType = null
    let filename = 'demo-content.txt'

    if (file && !useDemoContent) {
      fileType = file.type
      filename = file.name
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const uploadDir = path.join(process.cwd(), 'public', 'uploads')
      await mkdir(uploadDir, { recursive: true })

      const safeName = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const filePath = path.join(uploadDir, safeName)
      await writeFile(filePath, buffer)
      fileUrl = `/uploads/${safeName}`

      if (fileType === 'application/pdf') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pdfModule = await import('pdf-parse') as any
        const pdfParse = pdfModule.default || pdfModule
        const data = await pdfParse(buffer)
        rawText = data.text
      } else {
        rawText = buffer.toString('utf-8')
      }
    }

    let analysis
    if (!process.env.ANTHROPIC_API_KEY || useDemoContent) {
      analysis = await generateDemoContent()
    } else {
      analysis = await analyzeContent(rawText, filename)
    }

    const content = await prisma.content.create({
      data: {
        userId: session.id,
        title: analysis.title,
        summary: analysis.summary,
        keyPoints: JSON.stringify(analysis.keyPoints),
        flashcards: JSON.stringify(analysis.flashcards),
        fileUrl,
        fileType,
        tags: JSON.stringify(['AI analizi']),
        questions: {
          create: analysis.questions.map((q) => ({
            question: q.question,
            options: JSON.stringify(q.options),
            correctIndex: q.correctIndex,
            explanation: q.explanation,
          })),
        },
      },
      include: { questions: true },
    })

    await addPoints(session.id, POINTS.UPLOAD_CONTENT, 'upload')

    return NextResponse.json({ success: true, contentId: content.id })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Yükleme başarısız.' }, { status: 500 })
  }
}
