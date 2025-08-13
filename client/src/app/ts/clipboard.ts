export function copyToClipboard(text: string) {
	var textarea = document.createElement("textarea");
	textarea.textContent = text;
	textarea.style.position = "fixed";
	document.body.appendChild(textarea);
	textarea.select();
	try {
		document.execCommand("copy");
	} catch (ex) {
		console.warn("Copy to clipboard failed.", ex);
		prompt("Copy to clipboard: Ctrl+C, Enter", text);
	} finally {
		document.body.removeChild(textarea);
	}
}
