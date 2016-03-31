'use strict';

var svgEl = document.getElementById('svg'),
	leftEye = new Eye({
		center: {x: 89.8, y: 129.5},
		el: document.getElementById('SVGID_3_'),
		pupilEl: document.getElementById('left_pupil'),
		topEyelidEl: document.getElementById('top_left_eyelid'),
		browEl: document.getElementById('left_brow'),
		bottomEyelidEl: document.getElementById('bottom_left_eyelid'),
		topEyelidY: 95.3
	}),
	rightEye = new Eye({
		center: {x: 198.7, y: 133},
		el: document.getElementById('SVGID_2_'),
		pupilEl: document.getElementById('right_pupil'),
		topEyelidEl: document.getElementById('top_right_eyelid'),
		browEl: document.getElementById('right_brow'),
		bottomEyelidEl: document.getElementById('bottom_right_eyelid'),
		topEyelidY: 106.2
	}),
	eyeRadius = 21;


function Eye(attrs) {
	for(var key in attrs) {
		this[key] = attrs[key];
	}
	this.bottomEyelidY = + this.bottomEyelidEl.getAttribute('y');
}
Eye.prototype.lookAt = function(x, y) {
	if(Math.abs(this.pupilEl.getAttribute('cx') - x) > 200 || Math.abs(this.pupilEl.getAttribute('cy') - y) > 200) {
		this.pupilEl.setAttribute('style', 'transition: 50ms');
		this.topEyelidEl.setAttribute('style', 'transition: 50ms');
		this.bottomEyelidEl.setAttribute('style', 'transition: 50ms');
		this.browEl.setAttribute('style', 'transition: 50ms');
		this.browEl.setAttribute('style', 'transition: 50ms');
	} else {
		this.pupilEl.setAttribute('style', '');
		this.topEyelidEl.setAttribute('style', '');
		this.bottomEyelidEl.setAttribute('style', '');
		this.browEl.setAttribute('style', '');
		this.browEl.setAttribute('style', '');
	}
	this.pupilEl.setAttribute('cx', this.center.x + x);
	this.pupilEl.setAttribute('cy', this.center.y + y);
	this.topEyelidEl.setAttribute('y', Math.min(this.topEyelidY, this.topEyelidY + 1.1 * y));
	this.bottomEyelidEl.setAttribute('y', Math.max(this.bottomEyelidY, this.bottomEyelidY + 1.1 * y));
	this.browEl.style.transform = 'translateY(' + -quadrupleEllipseEqation(20, 4, 20, 1, y) + 'px)';
};
Eye.pupilRFromObjectDistance = function(r, d, capMin, capMax) {
	if(d <= capMin) return lineThroughPoints(0, r * 3 / 4, capMin, r * 3 / 4)(d);
	if(d >= capMax) return r;
	return lineThroughPoints(capMin, r * 3 / 4, capMax, r)(d);
}

function stare() {
	leftEye.pupilEl.setAttribute('style', 'transition: 1s');
	rightEye.pupilEl.setAttribute('style', 'transition: 1s');
	leftEye.topEyelidEl.setAttribute('style', 'transition: 1s');
	rightEye.topEyelidEl.setAttribute('style', 'transition: 1s');
	leftEye.bottomEyelidEl.setAttribute('style', 'transition: 1s');
	rightEye.bottomEyelidEl.setAttribute('style', 'transition: 1s');
	leftEye.pupilEl.setAttribute('cx', 89.2);
	leftEye.pupilEl.setAttribute('cy', 125.2);
	rightEye.pupilEl.setAttribute('cx', 199.3);
	rightEye.pupilEl.setAttribute('cy', 128.4);
	leftEye.topEyelidEl.setAttribute('y', leftEye.topEyelidY);
	rightEye.topEyelidEl.setAttribute('y', rightEye.topEyelidY);
	leftEye.bottomEyelidEl.setAttribute('y', leftEye.bottomEyelidY);
	rightEye.bottomEyelidEl.setAttribute('y', rightEye.bottomEyelidY);
	leftEye.browEl.setAttribute('style', 'transition: 1s');
	rightEye.browEl.setAttribute('style', 'transition: 1s');
}

setTimeout(function() {
	var onMoveTimer;

	document.addEventListener('mousemove', function(e) {
		var mouseX = e.clientX,
			mouseY = e.clientY,
			r = eyeRadius,
			leftEyeBB = leftEye.el.getBoundingClientRect(),
			rightEyeBB = rightEye.el.getBoundingClientRect(),
			mouseDistance,
			squintMinCap = (rightEyeBB.left - leftEyeBB.right) * 4,
			squintMaxCap = 500 * svgEl.getCTM().a,
			isSquint, middleEyesPoint;

		leftEyeBB.cx = leftEyeBB.left + r / 2;
		leftEyeBB.cy = leftEyeBB.top + r / 2;
		rightEyeBB.cx = rightEyeBB.left + r / 2;
		rightEyeBB.cy = rightEyeBB.top + r / 2;
		middleEyesPoint = {x: (leftEyeBB.cx + rightEyeBB.cx) / 2, y: (leftEyeBB.cy + rightEyeBB.cy) / 2};
		mouseDistance = Math.sqrt(Math.pow(mouseX - middleEyesPoint.x, 2) + Math.pow(mouseY - middleEyesPoint.y, 2));
		var pupilOffset = Eye.pupilRFromObjectDistance(r, mouseDistance, squintMinCap, squintMaxCap);
		isSquint = mouseDistance < squintMinCap;
		
		var leftEyeIntersection = intersectCircle(isSquint ? leftEyeBB.cx : middleEyesPoint.x, isSquint ? leftEyeBB.cy : middleEyesPoint.y, pupilOffset, e.clientX, e.clientY);
		var rightEyeIntersection = intersectCircle(isSquint ? rightEyeBB.cx : middleEyesPoint.x, isSquint ? rightEyeBB.cy : middleEyesPoint.y, pupilOffset, e.clientX, e.clientY);

		var averageY = (leftEyeIntersection.y + rightEyeIntersection.y) / 2;
		leftEye.lookAt(leftEyeIntersection.x, averageY);
		rightEye.lookAt(rightEyeIntersection.x, averageY);
		clearTimeout(onMoveTimer);
		onMoveTimer = setTimeout(function() {
			stare();
		}, 2000);
	});
}, 2000);



function intersectCircle(cx, cy, r, x, y) {
	var tg = (y - cy) / (x - cx);
	var alpha = Math.atan(tg);
	if(x < cx) alpha += Math.PI;
	if(alpha < 0) alpha += 2 * Math.PI;
	var sin = Math.sin(alpha);
	var cos = Math.cos(alpha);
	var ix = r * cos;
	var iy = r * sin;
	return {x: ix, y: iy, sin: sin};
}


function lineThroughPoints(x1, y1, x2, y2) {
	var cacheIndex = Array.prototype.join.call(arguments),
		k, b;

	if(lineThroughPoints._cache[cacheIndex]) return lineThroughPoints._cache[cacheIndex];
	k = (y1 - y2) / ( x1 - x2);
	b = (x1 * y2 - x2 * y1) / (x1 - x2);
	lineThroughPoints._cache[cacheIndex] = function(x) {
		return k * x + b;
	}
	return lineThroughPoints._cache[cacheIndex];
}
lineThroughPoints._cache = {};

function quadrupleEllipseEqation(a, b, a2, b2, x) {
	a = a / 2;
	b = b / 2;
	a2 = a2 / 2;
	b2 = b2 / 2;
	if(x < -2 * a) return 2 * b;
	if(x < -a) return b + b / a * Math.sqrt(-x * x - 4 * a * x - 3 * a * a);
	if(x < 0) return b - b / a * Math.sqrt(a * a - x * x);
	if(x < a2) return -b2 + b2 / a2 * Math.sqrt(a2 * a2 - x * x);
	if(x < 2 * a2) return -b2 - b2 / a2 * Math.sqrt(-x * x + 4 * a2 * x - 3 * a2 * a2);
	return - 2 * b2;
}