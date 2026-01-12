#!/usr/bin/env bun
/*
  Firefox Native Messaging Host (Bun)
  Name: firefox_profile_manager
  Purpose: Manage native Firefox profiles on Linux.
  Protocol: JSON messages with 4-byte little-endian length prefix via stdin/stdout.

  Message types:
  - { type: 'LIST_PROFILES' }
  - { type: 'CREATE_PROFILE', name: string, path?: string }
  - { type: 'DELETE_PROFILE', profilePath: string }
  - { type: 'START_PROFILE', profilePath: string }
  - { type: 'GET_PROFILE_INFO', profilePath: string }
*/

import { spawn, spawnSync } from 'node:child_process'
import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  rmSync,
  statSync,
  writeSync,
} from 'node:fs'
import { EOL } from 'node:os'
import { join, dirname } from 'node:path'

const log = (...args) => {
  try {
    // Log to stderr only so we don't break the native protocol on stdout
    console.error('[host]', ...args)
  } catch {}
}

const HOME = process.env.HOME || process.env.USERPROFILE || ''
  function detectFirefoxDir() {
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
      } catch {}
    }
    return candidates[0]
  }

  function getFirefoxDir() {
    return detectFirefoxDir()
  }

  function getProfilesIniPath() {
    return join(getFirefoxDir(), 'profiles.ini')
  }
const FIREFOX_DIR = join(HOME, '.mozilla', 'firefox')
const PROFILES_INI = join(FIREFOX_DIR, 'profiles.ini')
    const dir = getFirefoxDir()
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }
    mkdirSync(FIREFOX_DIR, { recursive: true })



// Minimal INI parser/serializer suitable for profiles.ini
function parseIni(text) {
  const sections = []
  let current = null
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

function serializeIni(sections) {
  const chunks = []
  for (const s of sections) {
    chunks.push(`[${s.name}]`)
    for (const [k, v] of Object.entries(s.entries)) {
      chunks.push(`${k}=${v}`)
    }
    chunks.push('')
  }
  return chunks.join(EOL)
}

    const iniPath = getProfilesIniPath()
    if (!existsSync(iniPath)) return []
    const content = readFileSync(iniPath, 'utf-8')
    return parseIni(content)
  const content = readFileSync(PROFILES_INI, 'utf-8')
  return parseIni(content)
}
    ensureFirefoxDir()
    const iniPath = getProfilesIniPath()
    const content = serializeIni(sections)
    writeFileSync(iniPath, content, 'utf-8')
  const content = serializeIni(sections)
  writeFileSync(PROFILES_INI, content, 'utf-8')
}

function listProfiles() {
  const sections = loadIni()
  const res = []
  for (const s of sections) {
    if (!/^Profile\d+$/.test(s.name)) continue
    const name = s.entries['Name'] || ''
      const base = getFirefoxDir()
      const p = isRel ? join(base, relPath) : relPath
    const relPath = s.entries['Path'] || ''
    const p = isRel ? join(FIREFOX_DIR, relPath) : relPath
    let created = Date.now()
    try {
      const st = statSync(p)
      created = st.ctimeMs || st.mtimeMs || created
    } catch {}
    res.push({ name, path: p, isDefault: s.entries['Default'] === '1', created })
  }
  return res
}

function findProfileByPath(profilePath) {
  const sections = loadIni()
  for (const s of sections) {
    if (!/^Profile\d+$/.test(s.name)) continue
      const base = getFirefoxDir()
      const absPath = isRel ? join(base, relPath) : relPath
    const relPath = s.entries['Path'] || ''
    const absPath = isRel ? join(FIREFOX_DIR, relPath) : relPath
    if (absPath === profilePath || relPath === profilePath) {
      return { section: s, absPath, relPath }
    }
  }
  return null
}

function createProfile(name, customPath) {
  // Prefer Firefox CLI to create valid profile structure
  try {
    const value = customPath ? `${name} ${customPath}` : name
    const result = spawnSync('firefox', ['-CreateProfile', value], { stdio: 'ignore' })
    if (result.error) throw result.error
  } catch (e) {
    return { error: `Failed to create profile via firefox: ${e.message || e}` }
  }
  // Readback
  const after = listProfiles().filter((p) => p.name === name)
  return after[0] || { success: true }
}

function deleteProfile(profilePath) {
  const sections = loadIni()
  const keep = []
  let removed = false
  let toDeletePath = null
  for (const s of sections) {
    if (!/^Profile\d+$/.test(s.name)) {
      keep.push(s)
      continue
    }
      const base = getFirefoxDir()
      const absPath = isRel ? join(base, relPath) : relPath
    const relPath = s.entries['Path'] || ''
    const absPath = isRel ? join(FIREFOX_DIR, relPath) : relPath
    if (absPath === profilePath || relPath === profilePath) {
      removed = true
      toDeletePath = absPath
      continue
    }
    keep.push(s)
  }
  if (removed) {
    try {
      rmSync(toDeletePath, { recursive: true, force: true })
    } catch {}
    // Renumber profile sections to be continuous (Profile0..N)
    const renumbered = []
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

function startProfile(profilePath) {
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
  } catch (e) {
    return { error: `Failed to launch firefox: ${e.message || e}` }
  }
}

function getProfileInfo(profilePath) {
  const hit = findProfileByPath(profilePath)
  if (!hit) return { error: 'Profile not found' }
  const s = hit.section
  const isRel = s.entries['IsRelative'] === '1'
    const absPath = isRel ? join(base, relPath) : relPath
  const absPath = isRel ? join(FIREFOX_DIR, relPath) : relPath
  let created = Date.now()
  try {
    const st = statSync(absPath)
    created = st.ctimeMs || st.mtimeMs || created
  } catch {}
  return {
    name: s.entries['Name'] || '',
    path: absPath,
    isDefault: s.entries['Default'] === '1',
    created,
  }
}

async function handleMessage(msg) {
  switch (msg?.type) {
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
    default:
      return { error: 'Unknown message type' }
  }
}

function readMessage() {
  const header = Buffer.alloc(4)
  const n = fsReadSync(0, header, 0, 4)
  if (n === 0) return null // EOF
  if (n < 4) throw new Error('Incomplete header')
  const len = header.readUInt32LE(0)
  const body = Buffer.alloc(len)
  let off = 0
  while (off < len) {
    const m = fsReadSync(0, body, off, len - off)
    if (m <= 0) throw new Error('Unexpected EOF')
    off += m
  }
  try {
    return JSON.parse(body.toString('utf-8'))
  } catch (e) {
    console.error('Failed to parse JSON message:', e)
    throw new Error('Invalid JSON')
  }
}

function writeMessage(obj) {
  const json = Buffer.from(JSON.stringify(obj), 'utf-8')
  const header = Buffer.alloc(4)
  header.writeUInt32LE(json.length, 0)
  fsWriteSync(1, header)
  fsWriteSync(1, json)
}

// Small wrappers using Bun.fs for sync reads/writes on stdin/stdout
function fsReadSync(fd, buf, offset, length) {
  // Bun lacks fs.readSync in some contexts; use Node API if available
  try {
    return readSync(fd, buf, offset, length)
  } catch {
    // Fallback not expected in Bun; throw
    throw new Error('readSync unavailable')
  }
}

function fsWriteSync(fd, buf) {
  try {
    return writeSync(fd, buf)
  } catch {
    throw new Error('writeSync unavailable')
  }
}

async function main() {
  try {
    // Process exactly one message then exit (Firefox usually connects per request)
    const msg = readMessage()
    if (msg == null) return
    const result = await handleMessage(msg)
    writeMessage(result)
  } catch (e) {
    try {
      writeMessage({ error: e?.message || String(e) })
    } catch {}
  }
}

main()
