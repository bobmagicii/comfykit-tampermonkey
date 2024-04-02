// ==UserScript==
// @name         ComfyKit
// @version      1.1.0
// @namespace    bobmagicii
// @author       bobmagicii
// @description  Extra keybindings for ComfyUI.
// @include      /https?:\/\/(.+?):8188\/(.*?)/
// @downloadURL  https://raw.githubusercontent.com/bobmagicii/comfykit-tampermonkey/master/comfykit-tampermonkey.js
// @updateURL    https://raw.githubusercontent.com/bobmagicii/comfykit-tampermonkey/master/comfykit-tampermonkey.js
// @grant        none
// ==/UserScript==

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

// NOTE: you may need to change the above @include directive if your port number
// of ComfyUI is different.

// ALT+Q: RESET COMFYUI VIEWPORT
// go to 0, 0 with a zoom of 1.0

// ALT+Z: CANCEL CURRENT JOB
// does some stuff to try and cancel the current job magically.

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

// DEV: ComfyUI is atm kinda inconsistent about if it gives special ui elements
// unique ids or not. so this script is kinda raw doing dumb things like text
// compare on buttons (rip internationalisation) and really lame duck checks of
// the dom structure.

// DEV: also ComfyUI's window.app is very disappointing with all the good things
// being private properties it seems. but i am also an idiot still and maybe
// even blind.

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

class ComfyKit {

	constructor() {

		// still avoiding the class def property syntax because old ass
		// safaris are still around in annoying quantity enough and this
		// macbook at work is already pissing me off so much with its alt
		// key bullshit.

		this.keys = null;
		this.showKeyEvents = true;

		////////

		this.defineExtraKeys();
		this.bindExtraKeys();

		////////

		console.log('[ComfyKit] Hello.');
		return;
	};

	defineExtraKeys() {

		this.keys = {
			viewportReset:  { alt: true, key: 'q', func: this.doViewportReset.bind(this) },
			queueCancelCur: { alt: true, key: 'z', func: this.doQueueCancelCur.bind(this) }
		};

		return;
	};

	bindExtraKeys() {

		window.addEventListener('keyup', this.onKeyUp.bind(this));
		return;
	};

	////////////////////////////////
	////////////////////////////////

	onKeyUp(ev) {

		let didSomething = false;

		if(this.showKeyEvents)
		console.log(ev);

		////////

		// on mac change your keyboard layout from US to "Unicode Hex Input" and alt key
		// stops being stupid. you're welcome. unless you're a linguist, which to be fair
		// is almost nobody.

		for(const key of Object.values(this.keys)) {
			if((key.alt && ev.altKey) && (ev.key == key.key)) {
				if(typeof key.func == 'function')
				didSomething = (key.func)();

				if(didSomething)
				break;
			}
		}

		////////

		if(didSomething) {
			window.app.canvas.setDirty(true, true);
			window.app.canvas.graph.change();
			ev.preventDefault();
			ev.stopPropagation();
			return false;
		}

		return;
	};

	////////////////////////////////
	////////////////////////////////

	doViewportReset() {

		console.log(`[ComfyKit] Reset Viewport`);
		window.app.canvas.ds.reset();

		return true;
	};

	doQueueCancelCur() {

		console.log(`[ComfyKit] Queue Cancel Current`);

		// if the queue has never been opened then the buttons have never
		// been added to it as if its not just always kept up to date for
		// the sake of quick toggle or query by dom. it also means we have
		// to wait for it to get populated from its remote api which can
		// take time.

		let showQueueBtn = document.querySelector('#comfy-view-queue-button');
		let tryQueueFunc = null;
		let tryQueueDelay = 100;
		let tryQueueFail = 0;

		////////

		if(!showQueueBtn) {
			console.log('[ComfyKit] failed to find show queue button');
			return false;
		}

		if(showQueueBtn.textContent !== 'Close') {
			tryQueueDelay *= 5;
			showQueueBtn.click();
		}

		////////

		tryQueueFunc = function() {

			let cancelBtn = document.querySelector(''
				+ '.comfy-menu .comfy-list .comfy-list-items '
				+ 'div:nth-of-type(1) button:nth-of-type(2)'
			);

			////////

			if(!cancelBtn && tryQueueFail < 10) {
				tryQueueFail += 1;
				setTimeout(tryQueueFunc, tryQueueDelay);
				console.log('[ComfyKit] could not find an item in the queue.');
				return;
			}

			if(!cancelBtn) {
				console.log('[ComfyKit] gave up trying to find items in the queue.');
				return;
			}

			////////

			if(cancelBtn.textContent !== 'Cancel' && tryQueueFail < 10) {
				tryQueueFail += 1;
				setTimeout(tryQueueFunc, tryQueueDelay);
				console.log('[ComfyKit] could not find an item cancel button.');
				return;
			}

			if(cancelBtn.textContent !== 'Cancel') {
				console.log('[ComfyKit] gave up trying to find a cancel button.');
				return;
			}

			////////

			cancelBtn.click();

			return;
		};

		setTimeout(tryQueueFunc, tryQueueDelay);

		return false;
	};

	////////////////////////////////
	////////////////////////////////

};

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

(function() {
	'use strict';

	let failcount = 0;
	let bootup = null;
	let ck = null;

	bootup = function() {

		if(window.app && window.graph) {
			ck = new ComfyKit;
			return;
		}

		if(failcount < 10) {
			failcount += 1;
			console.log(`[ComfyKit] bootup attempt #${failcount}`);
			setTimeout(bootup, 1000);
			return;
		}

		console.log('[ComfyKit] gave up trying to grapple onto comfyui.');
		return;
	};

	setTimeout(bootup, 500);
	return;
})();

