import { promises as fs } from 'node:fs'
import { randomUUID } from 'node:crypto'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'
import { isValidContent, validateContent } from './src/content/validation'

const projectRoot = dirname(fileURLToPath(import.meta.url))
const contentPath = resolve(projectRoot, 'src/content/content.json')
const editorModulePath = resolve(projectRoot, 'src/content/editor')
const editorModuleFilePath = `${editorModulePath}.tsx`
const editorDisabledModulePath = resolve(projectRoot, 'src/content/editor-disabled.tsx')
const contentWriterModulePath = resolve(projectRoot, 'src/content/content-writer')
const contentWriterModuleFilePath = `${contentWriterModulePath}.ts`
const contentWriterDisabledModulePath = resolve(projectRoot, 'src/content/content-writer-disabled.ts')
const maximumRequestBytes = 2 * 1024 * 1024

class RequestBodyTooLargeError extends Error {}

function isLoopbackAddress(address: string | undefined) {
  if (!address) return false
  const normalized = address.toLowerCase()
  if (normalized === '::1' || normalized === '0:0:0:0:0:0:0:1') return true
  if (normalized.startsWith('::ffff:')) return isLoopbackAddress(normalized.slice('::ffff:'.length))
  return normalized === '127.0.0.1' || normalized.startsWith('127.')
}

function sendText(response: ServerResponse, status: number, message: string) {
  response.statusCode = status
  response.setHeader('Content-Type', 'text/plain; charset=utf-8')
  response.end(message)
}

function readRequestBody(request: IncomingMessage) {
  return new Promise<string>((resolveBody, reject) => {
    const chunks: Buffer[] = []
    let size = 0
    let tooLarge = false

    request.on('data', (chunk: Buffer) => {
      if (tooLarge) return
      size += chunk.length
      if (size > maximumRequestBytes) {
        tooLarge = true
        request.resume()
        reject(new RequestBodyTooLargeError('요청 본문이 너무 큽니다.'))
        return
      }
      chunks.push(chunk)
    })
    request.on('end', () => {
      if (!tooLarge) resolveBody(Buffer.concat(chunks).toString('utf8'))
    })
    request.on('error', reject)
  })
}

async function writeContentFile(content: unknown) {
  const temporaryPath = `${contentPath}.${process.pid}.${randomUUID()}.tmp`
  const serialized = `${JSON.stringify(content, null, 2)}\n`

  try {
    await fs.writeFile(temporaryPath, serialized, { encoding: 'utf8', flag: 'wx' })
    await fs.rename(temporaryPath, contentPath)
  } finally {
    await fs.rm(temporaryPath, { force: true })
  }
}

function contentWriterPlugin(): Plugin {
  return {
    name: 'content-file-writer',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const pathname = request.url ? new URL(request.url, 'http://vite.local').pathname : ''
        if (pathname !== '/__content') {
          next()
          return
        }
        if (!isLoopbackAddress(request.socket.remoteAddress)) {
          sendText(response, 403, '로컬 요청만 허용됩니다.')
          return
        }
        if (request.method !== 'POST') {
          sendText(response, 405, 'POST만 허용됩니다.')
          return
        }

        void (async () => {
          let parsed: unknown
          try {
            parsed = JSON.parse(await readRequestBody(request))
          } catch (error) {
            const message = error instanceof RequestBodyTooLargeError ? error.message : 'JSON 본문을 해석할 수 없습니다.'
            sendText(response, error instanceof RequestBodyTooLargeError ? 413 : 400, message)
            return
          }

          if (!isValidContent(parsed)) {
            sendText(response, 400, validateContent(parsed).errors.join(' '))
            return
          }

          try {
            await writeContentFile(parsed)
            sendText(response, 200, JSON.stringify({ savedAt: new Date().toISOString() }))
          } catch (error) {
            const message = error instanceof Error ? error.message : '콘텐츠 파일을 저장하지 못했습니다.'
            sendText(response, 500, `콘텐츠 파일을 저장하지 못했습니다. ${message}`)
          }
        })()
      })
    },
  }
}

function productionModuleAliasPlugin(): Plugin {
  return {
    name: 'production-content-module-aliases',
    enforce: 'pre',
    apply: 'build',
    resolveId(source, importer) {
      if (!importer || !source.startsWith('.')) return null
      const sourcePath = resolve(dirname(importer), source)
      if (sourcePath === editorModulePath || sourcePath === editorModuleFilePath) return editorDisabledModulePath
      if (sourcePath === contentWriterModulePath || sourcePath === contentWriterModuleFilePath) return contentWriterDisabledModulePath
      return null
    },
  }
}

export default defineConfig(({ command }) => ({
  plugins: [productionModuleAliasPlugin(), react(), contentWriterPlugin()],
  base: '/',
  resolve: command === 'build' ? {
    alias: [
      { find: editorModulePath, replacement: editorDisabledModulePath },
      { find: editorModuleFilePath, replacement: editorDisabledModulePath },
      { find: contentWriterModulePath, replacement: contentWriterDisabledModulePath },
      { find: contentWriterModuleFilePath, replacement: contentWriterDisabledModulePath },
    ],
  } : undefined,
}))
