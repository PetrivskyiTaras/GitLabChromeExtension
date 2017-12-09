
var snowmax = 50;
var snowcolor = ["#AAAACC","#DDDDFF","#CCCCDD","#F3F3F3","#F0FFFF","#FFFFFF","#EFF5FF"];
var snowtype = ["Arial Black","Arial Narrow","Times","Comic Sans MS"];
var sinkspeed = 0.6;
var snowmaxsize = 40;
var snowminsize = 8;

/**
 * 1 - снег идет по всей ширине страницы.
 * 2 - расположение снега слева.
 * 3 - снег будет колонкой по средине.
 * 4 - снег будет справа.
 * @type {number}
 */
var snowingzone = 1;

var snow = [];
var marginbottom;
var marginright;
var x_mv = [];
var crds = [];
var lftrght = [];

var snowTimer;

function randommaker(range) {
    return Math.floor(range*Math.random());
}

function movesnow() {
    for(var i = 0; i <= snowmax; i++) {
        crds[i] += x_mv[i];
        snow[i].posy += snow[i].sink;
        snow[i].style.left = snow[i].posx +  lftrght[i] * Math.sin(crds[i]) + "px";
        snow[i].style.top = snow[i].posy + "px";
        if (snow[i].posy >= marginbottom - 2 * snow[i].size || parseInt(snow[i].style.left) > (marginright - 3 * lftrght[i])) {
            if (snowingzone == 1) {snow[i].posx = randommaker(marginright - snow[i].size)}
            if (snowingzone == 2) {snow[i].posx = randommaker(marginright / 2 - snow[i].size)}
            if (snowingzone == 3) {snow[i].posx = randommaker(marginright / 2 - snow[i].size) + marginright / 4}
            if (snowingzone == 4) {snow[i].posx = randommaker(marginright / 2 - snow[i].size) + marginright / 2}
            snow[i].posy = 0;
        }
    }
    snowTimer = setTimeout(function () {
        movesnow();
    }, 50);
}

function initSnow() {
    var snowsizerange = snowmaxsize - snowminsize;
    marginbottom = window.innerHeight;
    marginright = window.innerWidth;
    for (var j=0; j <= snowmax; j++) {
        var span = document.createElement('span');
        var text = document.createTextNode('*');
        span.appendChild(text);
        span.setAttribute('id', 'snowflake' + j);
        span.style.position = 'absolute';
        span.style.top = snowmaxsize + 'px';
        span.style.zIndex = 1000;
        span.style.userSelect = 'none';
        document.body.appendChild(span);
    }
    for (var t=0; t <= snowmax; t++) {
        crds[t] = 0;
        lftrght[t] = Math.random() * 15;
        x_mv[t] = 0.03 + Math.random() / 10;
        snow[t] = document.getElementById("snowflake" + t);
        snow[t].style.fontFamily = snowtype[randommaker(snowtype.length)];
        snow[t].size = randommaker(snowsizerange) + snowminsize;
        snow[t].style.fontSize = snow[t].size + "px";
        snow[t].style.color = snowcolor[randommaker(snowcolor.length)];
        snow[t].sink = sinkspeed * snow[t].size / 5;
        if (snowingzone == 1) {snow[t].posx = randommaker(marginright - snow[t].size)}
        if (snowingzone == 2) {snow[t].posx = randommaker(marginright / 2 - snow[t].size)}
        if (snowingzone == 3) {snow[t].posx = randommaker(marginright / 2 - snow[t].size) + marginright / 4}
        if (snowingzone == 4) {snow[t].posx = randommaker(marginright / 2 - snow[t].size) + marginright / 2}
        snow[t].posy = randommaker(2 * marginbottom - marginbottom - 2 * snow[t].size);
        snow[t].style.left = snow[t].posx + "px";
        snow[t].style.top = snow[t].posy + "px";
    }
    movesnow();
};

function removeSnow() {
    for (var h=0; h <= snowmax; h++) {
        var span = document.getElementById('snowflake' + h);
        document.body.removeChild(span);
    }
}

function disableSnow() {
    clearTimeout(snowTimer);
    removeSnow();
}

function getSnowEnable() {
    var cookie = document.cookie;
    if (!cookie || cookie.length === 0) {
        return false;
    }
    return document.cookie.split('snowEnable=')[1] === 'true';
}

function toggleSnow() {
    if (!getSnowEnable()) {
        disableSnow();
    } else {
        initSnow();
    }
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.handler) {
            document.cookie = 'snowEnable=' + request.snowEnable + '; path=/; expires=Fri, 31 Dec 2020 23:59:59 GMT';
            toggleSnow();
            sendResponse({success: true});
        } else {
            toggleSnow();
            sendResponse({
                snowEnable: getSnowEnable()
            });
        }
    });

window.addEventListener('load', function (event) {
    if (getSnowEnable()) {
        initSnow();
    }
});
