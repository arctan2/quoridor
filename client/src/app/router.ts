export function resetRouter() {
	history.pushState(null, '', '/');
	history.pushState(null, '', '/');
	window.history.go(-2);
}
