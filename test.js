import test from 'node:test'
import assert from 'node:assert'
import { JSDOM } from "jsdom";
import hijackScript from './lib/index.js';

const testDomHijack = (html, hijack, assertion) => {
	const { window } = new JSDOM(html, {
		runScripts: 'dangerously',
		beforeParse(window) {
			window.eval(`${hijackScript}`)
			window.evalFn = fn => window.eval(`(${fn})()`)
			hijack(window)
		}
	})

	setTimeout(_ => assertion(window)) // Hacky solution because stuff on dom happens async
}

test('Not matching executes original script', t => {
	testDomHijack(
		`<body><script>window.hijacked = false`,
		window => window.evalFn(_ => hijackScript(_ => false, txt => 'window.hijacked = true')),
		window => assert.strictEqual(window.hijacked, false)
	)
})

test('Hijacking inline script', t => {
	testDomHijack(
		`<body><script>window.hijacked = false`,
		window => window.evalFn(_ => hijackScript(script => script.textContent.includes('hijacked = false'), txt => txt.replace('false', 'true'))),
		window => assert.strictEqual(window.hijacked, true)
	)
})

test('Hijacking static script', t => {
	testDomHijack(
		`<body><script src="fake-test.js">`,
		window => {
			window.fetch = () => Promise.resolve({ text: () => 'window.hijacked = false' }) // "Mock" fetch 
			window.evalFn(_ => hijackScript(/fake-test.js/, txt => txt.replace('false', 'true')))
		},
		window => assert.strictEqual(window.hijacked, true)
	)
})
