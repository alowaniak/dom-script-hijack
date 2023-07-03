/**
 * Hijacks the first matching script that is going to be added to the DOM and replaces it with a transformed script.
 *
 * @remarks
 * Please note that the {@link MutationObserver} only observes changes made after it has been set up.
 * Any scripts that have already been added to the DOM before calling `hijackScript` will not be noticed or hijacked.
 * Therefore, it's recommended to call as early as possible in your code, ideally before the targeted scripts are added to the page.
 * Also *only* the *first* matching script will be hijacked, subsequent matching scripts will not be affected!
 *
 * @param scriptToHijack - Specifies the script to be hijacked. Can be a {@link RegExp | regular expression} for the {@link HTMLScriptElement.src | script src} or a custom matching function.
 * @param transformer - Transforms the original content of the hijacked script.
 *
 * @returns The `MutationObserver` instance used to detect added script. 
 * Although the observer will be disconnected when script is hijacked, the caller is encouraged to disconnect in case the script is not found.
 */
export default function hijackScript(
	scriptToHijack: RegExp | ((script: HTMLScriptElement) => boolean), 
	transformer: ((scriptContent: string) => string)
): MutationObserver {
	let scriptSearcher = scriptToHijack instanceof RegExp ? (script: HTMLScriptElement) => scriptToHijack.test(script.src) : scriptToHijack

	let observer = new MutationObserver(async (mutations) => {
		let oldScript = mutations
			.flatMap(e => [...e.addedNodes])
			.flatMap(e => e instanceof HTMLScriptElement ? e : [])
			.find(scriptSearcher)

		if (oldScript) {
			oldScript.remove()
			observer.disconnect()

			let newScript = document.createElement('script')
			newScript.type = oldScript.type
			newScript.textContent = transformer(
				oldScript.src ? await fetch(oldScript.src).then(e => e.text()) : oldScript.textContent ?? ''
			)

			document.head.appendChild(newScript)
		}
	})

	observer.observe(document, { childList: true, subtree: true})

	return observer
}
