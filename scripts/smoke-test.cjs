const assert = require("node:assert/strict")
const { chromium } = require("playwright")

const baseUrl = process.env.SMOKE_BASE_URL || "http://127.0.0.1:3002"
const routes = ["/", "/dashboard", "/chat", "/approvals", "/audit", "/adk"]



function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      const timeout = setTimeout(() => {
        clearTimeout(timeout)
        reject(new Error(`${label} timed out after ${ms}ms`))
      }, ms)
    }),
  ])
}

async function expectApiOk(context, path) {
  const response = await withTimeout(context.request.get(`${baseUrl}${path}`), 12_000, path)
  assert.equal(response.ok(), true, `${path} returned ${response.status()}`)
  return response.json()
}

async function main() {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } })
  const consoleIssues = []
  const failedRequests = []

  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type())) {
      consoleIssues.push(`${message.type()}: ${message.text()}`)
    }
  })
  page.on("requestfailed", (request) => {
    const errorText = request.failure()?.errorText || ""
    if (errorText === "net::ERR_ABORTED" && request.url().includes("_rsc=")) return
    failedRequests.push(`${request.method()} ${request.url()} ${errorText}`.trim())
  })

  for (const route of routes) {
    await withTimeout(page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" }), 20_000, route)
    const title = await page.title()
    const bodyText = await page.locator("body").innerText()
    assert.match(title, /SentinelMail AI/i, `${route} has unexpected title ${title}`)
    assert.match(bodyText, /SentinelMail|Terminal3|Agent/i, `${route} rendered without app content`)
    assert.equal(await page.locator("nextjs-portal").count(), 0, `${route} shows a framework overlay`)
  }

  await expectApiOk(page.context(), "/api/terminal3/session")
  await expectApiOk(page.context(), "/api/approvals")
  await expectApiOk(page.context(), "/api/audit")

  await page.goto(`${baseUrl}/chat`, { waitUntil: "networkidle" })
  await page.getByLabel("SentinelMail command").fill("Summarize today's emails")
  await page.getByRole("button", { name: /run agent/i }).click()
  await expectApiOk(page.context(), "/api/audit")
  await page.getByText(/Daily digest generated|Latest Terminal3 proof/i).first().waitFor({ timeout: 15_000 })

  assert.deepEqual(consoleIssues, [], `Console issues:\n${consoleIssues.join("\n")}`)
  assert.deepEqual(failedRequests, [], `Failed requests:\n${failedRequests.join("\n")}`)

  await browser.close()
  console.log(`Smoke test passed against ${baseUrl}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
