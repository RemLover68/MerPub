// File System Access API utilities
// Requires Chrome/Edge - prompts user to pick a directory

export async function pickDirectory() {
  const handle = await window.showDirectoryPicker({ mode: 'readwrite' })
  return handle
}

export async function readJson(dirHandle, filename) {
  try {
    const fh = await dirHandle.getFileHandle(filename)
    const file = await fh.getFile()
    const text = await file.text()
    return JSON.parse(text)
  } catch {
    return null
  }
}

export async function writeJson(dirHandle, filename, data) {
  const fh = await dirHandle.getFileHandle(filename, { create: true })
  const writable = await fh.createWritable()
  await writable.write(JSON.stringify(data, null, 2))
  await writable.close()
}

export function isSupported() {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window
}
