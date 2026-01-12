import { spawn, spawnSync } from 'node:child_process'
import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  rmSync,
  statSync,
  readSync,
  writeSync,
} from 'node:fs'
import { EOL } from 'node:os'
import { join } from 'node:path'

// Types
export type Message =
  | { type: 'LIST_PROFILES' }
  | { type: 'CREATE_PROFILE'; name: string; path?: string }
  | { type: 'DELETE_PROFILE'; profilePath: string }
  | { type: 'START_PROFILE'; profilePath: string }
  | { type: 'GET_PROFILE_INFO'; profilePath: string }

export interface ProfileInfo {
  name: string
  path: string
  isDefault: boolean
  created: number
}

interface IniSection {
  name: string
  entries: Record<string, string>
}

const HOME = process.env.HOME || process.env.USERPROFILE || ''

// Detect Firefox profile directory across common Linux distributions (native, Snap, Flatpak)
function detectFirefoxDir(): string {
  const candidates = [
    join(HOME, '.mozilla', 'firefox'),
    join(HOME, 'snap', 'firefox', 'common', '.mozilla', 'firefox'),
    join(HOME, '.var', 'app', 'org.mozilla.firefox', '.mozilla', 'firefox'),
  ]
  for (const dir of candidates) {
    try {
      if (existsSync(join(dir, 'profiles.ini')) || existsSync(dir)) {
        return dir
      }
    } catch {
      // ignore
    }
  }
  return candidates[0]
}

function getFirefoxDir(): string {
  return detectFirefoxDir()
}

function getProfilesIniPath(): string {
  return join(getFirefoxDir(), 'profiles.ini')
}

function ensureFirefoxDir(): void {
  const dir = getFirefoxDir()
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
}

// Minimal INI parser/serializer suitable for profiles.ini
function parseIni(text: string): IniSection[] {
  const sections: IniSection[] = []
  let current: IniSection | null = null
  const lines = text.split(/\r?\n/)
  for (const raw of lines) {
    const line = raw.trim()
    if (!line) continue
    if (line.startsWith(';') || line.startsWith('#')) continue
    if (line.startsWith('[') && line.endsWith(']')) {
      current = { name: line.slice(1, -1), entries: {} }
      sections.push(current)
      continue
    }
    const eq = line.indexOf('=')
    if (eq > 0 && current) {
      const k = line.slice(0, eq).trim()
      const v = line.slice(eq + 1).trim()
      current.entries[k] = v
    }
  }
  return sections
}

function serializeIni(sections: IniSection[]): string {
  const chunks: string[] = []
  for (const s of sections) {
    chunks.push(`[${s.name}]`)
    for (const [k, v] of Object.entries(s.entries)) {
      chunks.push(`${k}=${v}`)
    }
    chunks.push('')
  }
  return chunks.join(EOL)
}

function loadIni(): IniSection[] {
  ensureFirefoxDir()
  const iniPath = getProfilesIniPath()
  if (!existsSync(iniPath)) return []
  const content = readFileSync(iniPath, 'utf-8')
  return parseIni(content)
}

function saveIni(sections: IniSection[]): void {
  ensureFirefoxDir()
  const iniPath = getProfilesIniPath()
  const content = serializeIni(sections)
  writeFileSync(iniPath, content, 'utf-8')
}

function listProfiles(): ProfileInfo[] {
  const sections = loadIni()
  const res: ProfileInfo[] = []
  const base = getFirefoxDir()
  for (const s of sections) {
    if (!/^Profile\d+$/.test(s.name)) continue
    const name = s.entries['Name'] || ''
    const isRel = s.entries['IsRelative'] === '1'
    const relPath = s.entries['Path'] || ''
    const p = isRel ? join(base, relPath) : relPath
    let created = Date.now()
    try {
      const st = statSync(p)
      created = st.ctimeMs || st.mtimeMs || created
    } catch {
      // ignore
    }
    res.push({ name, path: p, isDefault: s.entries['Default'] === '1', created })
  }
  return res
}

function findProfileByPath(
  profilePath: string,
): { section: IniSection; absPath: string; relPath: string } | null {
  const sections = loadIni()
  const base = getFirefoxDir()
  for (const s of sections) {
    if (!/^Profile\d+$/.test(s.name)) continue
    const isRel = s.entries['IsRelative'] === '1'
    const relPath = s.entries['Path'] || ''
    const absPath = isRel ? join(base, relPath) : relPath
    if (absPath === profilePath || relPath === profilePath) {
      return { section: s, absPath, relPath }
    }
  }
  return null
}

function createProfile(
  name: string,
  customPath?: string,
): ProfileInfo | { success: true } | { error: string } {
  try {
    const value = customPath ? `${name} ${customPath}` : name
    const result = spawnSync('firefox', ['-CreateProfile', value], { stdio: 'ignore' })
    if (result.error) throw result.error
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return { error: `Failed to create profile via firefox: ${msg}` }
  }
  const after = listProfiles().filter((p) => p.name === name)
  return after[0] || { success: true }
}

function deleteProfile(profilePath: string): { success: boolean } {
  const sections = loadIni()
  const keep: IniSection[] = []
  let removed = false
  let toDeletePath: string | null = null
  const base = getFirefoxDir()
  for (const s of sections) {
    if (!/^Profile\d+$/.test(s.name)) {
      keep.push(s)
      continue
    }
    const isRel = s.entries['IsRelative'] === '1'
    const relPath = s.entries['Path'] || ''
    const absPath = isRel ? join(base, relPath) : relPath
    if (absPath === profilePath || relPath === profilePath) {
      removed = true
      toDeletePath = absPath
      continue
    }
    keep.push(s)
  }
  if (removed) {
    try {
      if (toDeletePath) rmSync(toDeletePath, { recursive: true, force: true })
    } catch {
      // ignore
    }
    const renumbered: IniSection[] = []
    let idx = 0
    for (const s of keep) {
      if (/^Profile\d+$/.test(s.name)) {
        renumbered.push({ name: `Profile${idx++}`, entries: s.entries })
      } else {
        renumbered.push(s)
      }
    }
    saveIni(renumbered)
  }
  return { success: removed }
}

function startProfile(profilePath: string): { success: true } | { error: string } {
  const hit = findProfileByPath(profilePath)
  if (!hit) return { error: 'Profile not found' }
  const name = hit.section.entries['Name']
  try {
    const child = spawn('firefox', ['-P', name, '-no-remote', '-new-instance'], {
      detached: true,
      stdio: 'ignore',
    })
    child.unref()
    return { success: true }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return { error: `Failed to launch firefox: ${msg}` }
  }
}

function getProfileInfo(profilePath: string): ProfileInfo | { error: string } {
  const hit = findProfileByPath(profilePath)
  if (!hit) return { error: 'Profile not found' }
  const s = hit.section
  const isRel = s.entries['IsRelative'] === '1'
  const relPath = s.entries['Path'] || ''
  const base = getFirefoxDir()
  const absPath = isRel ? join(base, relPath) : relPath
  let created = Date.now()
  try {
    const st = statSync(absPath)
    created = st.ctimeMs || created
  } catch {
    // ignore
  }
  return {
    name: s.entries['Name'] || '',
    path: absPath,
    isDefault: s.entries['Default'] === '1',
    created,
  }
}

// Native messaging wire protocol
function readMessage(): Message | null {
  const header = Buffer.alloc(4)
  const n = readSync(0, header, 0, 4)
  if (n === 0) return null // EOF
  if (n < 4) throw new Error('Incomplete header')
  const len = header.readUInt32LE(0)
  const body = Buffer.alloc(len)
  let off = 0
  while (off < len) {
    const m = readSync(0, body, off, len - off)
    if (m <= 0) throw new Error('Unexpected EOF')
    off += m
  }
  const raw = JSON.parse(body.toString('utf-8')) as unknown
  // Minimal runtime checking; assume extension sends correct shapes
  return raw as Message
}

function writeMessage(obj: unknown): void {
  const json = Buffer.from(JSON.stringify(obj), 'utf-8')
  const header = Buffer.alloc(4)
  header.writeUInt32LE(json.length, 0)
  writeSync(1, header)
  writeSync(1, json)
}

async function handleMessage(msg: Message): Promise<unknown> {
  switch (msg.type) {
    case 'LIST_PROFILES':
      return listProfiles()
    case 'CREATE_PROFILE':
      return createProfile(String(msg.name || 'User'), msg.path ? String(msg.path) : undefined)
    case 'DELETE_PROFILE':
      return deleteProfile(String(msg.profilePath || ''))
    case 'START_PROFILE':
      return startProfile(String(msg.profilePath || ''))
    case 'GET_PROFILE_INFO':
      return getProfileInfo(String(msg.profilePath || ''))
  }
}

async function main(): Promise<void> {
  try {
    const msg = readMessage()
    if (msg == null) return
    const result = await handleMessage(msg)
    writeMessage(result)
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e)
    try {
      writeMessage({ error: err })
    } catch {
      // ignore
    }
  }
}

void main()
