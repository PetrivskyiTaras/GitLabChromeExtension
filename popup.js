
var snowConfig = {
    checkBoxId: 'snow-switcher',
    snowStatusTextId: 'snow-switcher-text'
}

function toggleSnowSwitcherText(checked) {
    var textEl = document.getElementById(snowConfig.snowStatusTextId);
    if (textEl) {
        textEl.innerText = checked ? 'Snow is enabled' : 'Snow is disabled';
    }
}

function init() {
    var checkBoxEl = document.getElementById(snowConfig.checkBoxId);
    if (!checkBoxEl) {
        return;
    }
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            handler: false
        }, function(response) {
            checkBoxEl.checked = response.snowEnable;
            toggleSnowSwitcherText(response.snowEnable);

            checkBoxEl.addEventListener('change', function (event) {
                var checked = event.target.checked;
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        snowEnable: checked,
                        handler: true
                    }, function(response) {
                        if (response.success) {
                            toggleSnowSwitcherText(checked);
                        }
                    });
                });
            });
        });
    });
}

init();