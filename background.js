var changingAllreadyAndDoNotNeedAgain = false;
var toggleFileContentClassName = 'toggle-file-content';
var toggleAllFileContentClassName = 'toggle-all-file-content';
var iteratingFiles = false;
var defaultSettings = {
	icon: {
		downClassName: 'fa fa-caret-square-o-down',
		upClassName: 'fa fa-caret-square-o-up'
    },
	button: {
		hideText: 'Hide content',
		hideAllText: 'Hide all',
		showText: 'Show content',
		showAllText: 'Show all',
		visibleStatusAttr: 'content-visible'
	},
    file: {
	    newColor: '#097b1b',
        deletedColor: '#bd1111'
    },
    regex: {
	    deleted: /(deleted).*[\r|\p|\n|.]*<.*>[\r|\p|\n|.]*[0-9]{6}.?(\u2192.?0)/i,
        added: /0.?\u2192.?[0-9]{6}/i
    }
}

// region: Util methods

function iterateFiles(files, callback) {
    try {
        if (files && files.length > 0 && typeof callback === 'function') {
            iteratingFiles = true;
            for(var f = 0; f < files.length; f++) {
                callback(files[f]);
            };
            iteratingFiles = false;
        };
    } catch (err) {
        iteratingFiles = false;
        console.warn('Something was wrong while where iterating files', err);
    }

}

// endregion

// region: Comments

function updateToggleCommentButton(file) {
    var controls = file.querySelector('.diff-controls');
    var commentButton = controls.querySelector('a.js-toggle-diff-comments');
    if (!commentButton.classList.contains('updated')) {
        var fileComments = file.querySelectorAll('tr.notes_holder ul.notes > li');
        commentButton.innerHTML += fileComments.length;
        commentButton.className += ' updated';
    }
}

// endregion

// region: Toggle button

function addToggleButton(file) {
    var controls = file.querySelector('.diff-controls');
    var toggleBtn = controls.querySelector('.' + toggleFileContentClassName);
    if (!toggleBtn) {
        var btn = getToggleButton();
        btn.setAttribute(defaultSettings.button.visibleStatusAttr, 'true');
        btn.addEventListener('click', function (event) {
            toggleButtonHandler(event);
        });
        controls.prepend(btn);
    }
}

function addToggleAllButton(btnGroup) {
    var toggleAllBtn = btnGroup.querySelector('.' + toggleAllFileContentClassName);
    if (!toggleAllBtn) {
        var btn = getToggleAllButton();
        btn.setAttribute(defaultSettings.button.visibleStatusAttr, 'true');
        btn.addEventListener('click', function (event) {
            toggleAllButtonHandler(event);
        });
        btnGroup.prepend(btn);
    }
}

function getDefaultToggleButton(single) {
    var btn = document.createElement('a');
    var textSpan = document.createElement('span');
    var textContent  = single ? defaultSettings.button.hideText : defaultSettings.button.hideAllText;
    var text = document.createTextNode(textContent);
    var fa = document.createElement('i');
    fa.className = defaultSettings.icon.upClassName;
    fa.setAttribute('aria-hidden', 'true');
    fa.setAttribute('style', 'margin-left: 5px;');
    btn.className = 'btn btn-small ' + toggleFileContentClassName;
    btn.setAttribute('href', '#');
    btn.setAttribute('style', 'margin-right: 5px;');
    textSpan.appendChild(text);
    btn.appendChild(textSpan);
    btn.appendChild(fa);
    return btn;
}

function getToggleButton() {
    var btn = getDefaultToggleButton(true);
    btn.className = 'btn btn-small ' + toggleFileContentClassName;
    return btn;
}

function getToggleAllButton() {
    var btn = getDefaultToggleButton(false);
    btn.className = 'btn ' + toggleAllFileContentClassName;
    return btn;
}

function toggleButtonHandler(event) {
    event.preventDefault();
    event.stopPropagation();
    var btn = getTargetButton(event);
    var content = btn.parentElement.parentElement.nextElementSibling;
    if (content) {
        var visible = btn.getAttribute(defaultSettings.button.visibleStatusAttr);
        toggleButtonParams(btn, visible, true)
        toggleContentVisible(content, visible);
    }
}

function toggleAllButtonHandler(event) {
    event.preventDefault();
    event.stopPropagation();
    var toggleAllBtn = getTargetButton(event);
    var toggleButtons = document.querySelectorAll('.files .diff-header .' + toggleFileContentClassName);
    if (toggleButtons && toggleButtons.length > 0) {
        var visibleAllStatus = toggleAllBtn.getAttribute(defaultSettings.button.visibleStatusAttr);
        for (var j = 0; j < toggleButtons.length; j++) {
            var btn = toggleButtons[j];
            var visibleStatus = btn.getAttribute(defaultSettings.button.visibleStatusAttr);
            if (visibleStatus === visibleAllStatus) {
                toggleButtons[j].click();
            }
        }
        toggleButtonParams(toggleAllBtn, visibleAllStatus, false);
    }
}

function toggleButtonParams(btn, visibleStatus, single) {
    var textSpan = btn.querySelector('span');
    var buttonSettings = defaultSettings.button;
    if (visibleStatus === 'true') {
        textSpan.innerText = single ? buttonSettings.showText : buttonSettings.showAllText;
        btn.children[1].className = defaultSettings.icon.downClassName
    } else {
        textSpan.innerText = single ? buttonSettings.hideText : buttonSettings.hideAllText;
        btn.children[1].className = defaultSettings.icon.upClassName;
    }
    toggleContentVisibleStatus(btn);
}

function toggleContentVisible(content, visibleStatus) {
    if (visibleStatus === 'true') {
        content.style.display = 'none';
    } else {
        content.style.display = 'block';
    }
}

function getTargetButton(event) {
    var target = event.target;
    if (target.tagName === 'SPAN' || target.tagName === 'I') {
        target = target.parentElement;
    }
    return target;
}

function toggleContentVisibleStatus(btn) {
    var attrValue = btn.getAttribute(defaultSettings.button.visibleStatusAttr);
    btn.setAttribute(defaultSettings.button.visibleStatusAttr, attrValue === 'true' ? 'false': 'true');
}

function markFile(file) {
    var fileTextEl = file.querySelector('.diff-header > span');
    if (fileTextEl) {
        markFileStatus(fileTextEl);
    }
}

function markFileStatus(fileTextEl) {
    if (fileTextEl.innerHTML.search(defaultSettings.regex.deleted) > 0) {
        updateFileNameColor(fileTextEl, defaultSettings.file.deletedColor);
    } else if (fileTextEl.innerHTML.search(defaultSettings.regex.added) > 0) {
        updateFileNameColor(fileTextEl, defaultSettings.file.newColor);
    }
}

function updateFileNameColor(fileTextEl, color) {
    var filePathLink = fileTextEl.querySelector('a');
    fileTextEl.style.color = color;
    filePathLink.style.color = color;
}

// endregion

// region: Build status

function updateStatusStyle() {
    var buildTable = document.querySelector('.table.builds');
    if (buildTable) {
        changingAllreadyAndDoNotNeedAgain = true;
        var buildLinks = buildTable.querySelectorAll('td.status .ci-status.ci-running');
        if (buildLinks && buildLinks.length > 0) {
            for(var i = 0; i < buildLinks.length; i++ ){
                buildLinks[i].style.borderColor = '#3ed419';
                buildLinks[i].style.color = '#3ed419';
                var spinner = buildLinks[i].getElementsByTagName('i')[0];
                spinner.className = 'fa fa-spinner fa-pulse fa-fw';
            }
        }
        changingAllreadyAndDoNotNeedAgain = false;
    }
};

// endregion

// region: Start

function init() {
    document.addEventListener('DOMSubtreeModified', function(){
        var diffsContent = document.getElementById('diffs');
        var files;
        if (diffsContent) {
            files = diffsContent.querySelectorAll('.files .diff-file');
        } else {
            files = document.querySelectorAll('.content .files .diff-file');
        }
        if (files) {
            if (!iteratingFiles) {
                iterateFiles(files, function (file) {
                    addToggleButton(file);
                    updateToggleCommentButton(file);
                    markFile(file);
                });
            }
            var btnGroup = document.querySelector('.inline-parallel-buttons .btn-group');
            if (btnGroup) {
                addToggleAllButton(btnGroup);
            }
        }
    }, false);

    document.addEventListener('DOMSubtreeModified', function(){
        if (!changingAllreadyAndDoNotNeedAgain) {
            updateStatusStyle();
        }
    }, false);

    updateStatusStyle();
}

init();

// endregion