import { spawn } from 'node:child_process'
import { resolve } from 'node:path'

const mode = process.argv[2]
const basePort = Number(process.env.KLEAN_STORYBOOK_PORT ?? 6006)
const root = process.cwd()
const storybook = process.platform === 'win32' ? 'storybook.cmd' : 'storybook'

const renderers = [
  { name: 'Vue', config: '.storybook-vue', port: basePort + 1, output: 'vue' },
  {
    name: 'React',
    config: '.storybook-react',
    port: basePort + 2,
    output: 'react',
  },
  {
    name: 'Svelte',
    config: '.storybook-svelte',
    port: basePort + 3,
    output: 'svelte',
  },
]

function run(args, options = {}) {
  return spawn(storybook, args, {
    cwd: root,
    env: { ...process.env, ...options.env },
    stdio: 'inherit',
  })
}

function waitFor(child, name) {
  return new Promise((accept, reject) => {
    child.once('error', reject)
    child.once('exit', (code, signal) => {
      if (code === 0) accept()
      else reject(new Error(`${name} exited with ${signal ?? `code ${code}`}`))
    })
  })
}

async function build() {
  await waitFor(
    run([
      'build',
      '--config-dir',
      '.storybook',
      '--output-dir',
      resolve(root, 'storybook-static'),
    ]),
    'Klean UI workbench'
  )

  for (const renderer of renderers) {
    await waitFor(
      run([
        'build',
        '--config-dir',
        renderer.config,
        '--output-dir',
        resolve(root, 'storybook-static', renderer.output),
      ]),
      renderer.name
    )
  }
}

async function waitForServer(url, timeout = 30_000) {
  const deadline = Date.now() + timeout

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url)
      if (response.ok) return
    } catch {
      // The renderer is still starting.
    }

    await new Promise((accept) => setTimeout(accept, 100))
  }

  throw new Error(`Timed out waiting for ${url}`)
}

async function develop() {
  const children = []
  let stopping = false
  let remaining = 0

  const urls = Object.fromEntries(
    renderers.map((renderer) => [
      `KLEAN_STORYBOOK_${renderer.name.toUpperCase()}_URL`,
      `http://127.0.0.1:${renderer.port}`,
    ])
  )

  function stop(signal = 'SIGTERM') {
    if (stopping) return
    stopping = true
    for (const child of children) {
      if (!child.killed) child.kill(signal)
    }
  }

  function watch(child) {
    remaining += 1
    child.once('error', (error) => {
      console.error(error)
      process.exitCode = 1
      stop()
    })
    child.once('exit', (code, signal) => {
      remaining -= 1
      if (!stopping) {
        console.error(`A Storybook exited with ${signal ?? `code ${code}`}.`)
        process.exitCode = code ?? 1
        stop()
      }
      if (remaining === 0) process.exit(process.exitCode ?? 0)
    })
  }

  process.once('SIGINT', () => stop('SIGINT'))
  process.once('SIGTERM', () => stop('SIGTERM'))

  for (const renderer of renderers) {
    const child = run([
      'dev',
      '--config-dir',
      renderer.config,
      '--port',
      String(renderer.port),
      '--no-open',
    ])
    children.push(child)
    watch(child)
  }

  try {
    await Promise.all(
      renderers.map((renderer) =>
        waitForServer(`http://127.0.0.1:${renderer.port}/iframe.html`)
      )
    )
  } catch (error) {
    console.error(error)
    process.exitCode = 1
    stop()
    return
  }

  const host = run(
    [
      'dev',
      '--config-dir',
      '.storybook',
      '--port',
      String(basePort),
      '--no-open',
    ],
    { env: urls }
  )
  children.push(host)
  watch(host)
}

if (mode === 'build') {
  build().catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
} else if (mode === 'dev') {
  develop().catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
} else {
  console.error('Usage: node scripts/storybook.js <dev|build>')
  process.exitCode = 1
}
