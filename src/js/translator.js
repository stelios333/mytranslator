// Import all of Bootstrap's JS
import * as bootstrap from 'bootstrap'

const corsProxies = ["https://api.allorigins.win/raw?url=", "https://cors-proxy.fringe.zone/", "https://cors-anywhere-dkzk.onrender.com/", "https://corsproxy.s333.workers.dev/?"]
var corsProxyIndex = 0

const simulateUnsupportedBrowser = /modal-show=([^&]+)/.exec(window.location.href) || [null, "false"]
const currentVersion = "1.7.4b"
const output = document.getElementById("output")
const toLangInput = document.getElementById('lang')
const srcLangInput = document.getElementById('srclang')
const errorMessage = document.getElementById("error")
const translationInfo = document.getElementById("output-info")
const loadingSpinner = document.getElementById("loader")
const translateBtn = document.getElementById("trigger")
const srcText = document.getElementById("srctext")
const retryBtn = document.getElementById("retry")
const aboutMeLink = document.getElementById("aboutMeLnk")
const browserInfoLink = document.getElementById("browserInfoLnk")
const statsContainer = document.getElementById("statsContainer")
const translateBtnIcon = document.getElementById("translateIcon")
const speakBtn = document.getElementById("ttsTrigger")
const stopBtn = document.getElementById("ttsStop")
const ttsLang = document.getElementById("ttslang")
const ttsText = document.getElementById("ttstext")
const translatorLink = document.getElementById("translatorLink")
const ttsLink = document.getElementById("ttsLink")
const voiceSettingsContainer = document.getElementById("voiceSettingsContainer")
const ttsRateSlider = document.getElementById("rateSlider")
const ttsPitchSlider = document.getElementById("pitchSlider")
const ttsPage = document.querySelectorAll(".page-content")[0]
const translatorPage = document.querySelectorAll(".page-content")[1]
const loadingScreen = document.querySelector(".loading-container")
const navbar = document.getElementById("navbar")
const navLinks = document.querySelectorAll('.nav-item:not(.dropdown),.dropdown-item');
const menuToggle = document.getElementById('collapsibleNavbar');
const navbarCollapse = bootstrap.Collapse.getOrCreateInstance(menuToggle, { toggle: false });

let unsupportedBrowserPopup = bootstrap.Modal.getOrCreateInstance(document.getElementById("unsupportedBrowserModal"))
let aboutMeModal = bootstrap.Modal.getOrCreateInstance(document.getElementById("about"))
let browserInfoModal = bootstrap.Modal.getOrCreateInstance(document.getElementById("browser"))
let changelogToast = bootstrap.Toast.getOrCreateInstance(document.getElementById("changelog"))

let utterance = new SpeechSynthesisUtterance();
let urlParams = new URLSearchParams(window.location.search)

if (urlParams.get("tts") != null) {
    ttsmode()
}

translatorLink.onclick = () => {
    window.history.pushState('page1', "", '/');
    translatormode()
}

ttsLink.onclick = () => {
    window.history.pushState('page2', "", '?tts');
    ttsmode()
}

// Hide navbar when clicking outside of it on mobile
window.onclick = () => {
    navbarCollapse.hide()
}

navbar.onclick = (e) => {
    e.stopPropagation()
}

window.onload = () => {
    validateTranslatorInput()
    validateTtsInput()
    loadingScreen.style.opacity = "0"
    loadingScreen.ontransitionend = () => {
        loadingScreen.style.display = "none"
    }
}

// Show and update values for settings
Array.from(voiceSettingsContainer.children).forEach((el) => {
    let valueDisplay = el.querySelector("span.slider-value")
    let slider = el.querySelector("input[type=range]")
    valueDisplay.textContent = slider.value
    slider.oninput = (sl) => {
        valueDisplay.textContent = sl.target.value
    }
})

srcText.oninput = () => {
    validateTranslatorInput()
}

ttsText.oninput = () => {
    validateTtsInput()
}

utterance.onend = () => {
    speakBtn.classList.remove("d-none")
    stopBtn.classList.add("d-none")
}

retryBtn.onclick = translateBtn.onclick = () => {
    tran()
}

browserInfoLink.onclick = () => {
    browserInfoModal.show()
}

aboutMeLink.onclick = () => {
    aboutMeModal.show()
}

speakBtn.onclick = () => {
    speak()
}

stopBtn.onclick = () => {
    speechSynthesis.cancel()
    utterance.onend()
}

// Collapse navbar when clicking items on mobile
navLinks.forEach(function (l) {
    l.addEventListener('click', function () {
        // avoid flickering on desktop 
        if (menuToggle.classList.contains('show')) {
            navbarCollapse.hide()
        }
    });
});

navigator.sayswho = (() => {
    var ua = navigator.userAgent;
    var tem;
    var M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if (/trident/i.test(M[1])) {
        tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
        return 'IE ' + (tem[1] || '');
    }
    if (M[1] === 'Chrome') {
        tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
        if (tem != null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
    if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
    return M.join(' ');
})();

document.getElementById("changelogVersion").innerText = `version ${currentVersion}`
document.getElementById("browserName").innerHTML = `Browser: ${navigator.sayswho}<br>Full user agent: ${navigator.userAgent}`

// Show changelog popup
if (localStorage[currentVersion] !== "true") {
    changelogToast.show()
    localStorage[currentVersion] = "true"
}

if (simulateUnsupportedBrowser[1] == "true") {
    unsupportedBrowserPopup.show()
}

if (typeof fetch == "undefined") {
    unsupportedBrowserPopup.show()
    document.getElementById("browserInfo").innerHTML = "You are using an old browser or an unsupported one."

}
document.getElementById('lang').value = navigator.language.split("-")[0]
document.getElementById('srctext').focus()

function ttsmode() {
    ttsLink.classList.add("active")
    translatorLink.classList.remove("active")
    translatorPage.classList.add("d-none")
    ttsPage.classList.remove("d-none")
}

function translatormode() {
    ttsLink.classList.remove("active")
    translatorLink.classList.add("active")
    translatorPage.classList.remove("d-none")
    ttsPage.classList.add("d-none")
    speechSynthesis.cancel()
}

function validateTranslatorInput() {
    if (srcText.value == "") {
        translateBtn.disabled = true
    } else {
        translateBtn.disabled = false
    }
}

function validateTtsInput() {
    if (ttsText.value == "") {
        speakBtn.disabled = true
    } else {
        speakBtn.disabled = false
    }
}

function speak() {
    speakBtn.classList.add("d-none")
    stopBtn.classList.remove("d-none")
    utterance.text = ttsText.value;
    utterance.lang = ttsLang.value;
    utterance.pitch = ttsPitchSlider.value / 50
    utterance.rate = ttsRateSlider.value / 50
    speechSynthesis.speak(utterance);
}

function doRequest(timerOffset = 0) {
    var corsProxy = corsProxies[corsProxyIndex]
    var start_time = Date.now() - timerOffset;
    var from = srcLangInput.value
    var to = toLangInput.value
    var text = srcText.value
    var raw_url = "http://translate.googleapis.com/translate_a/single?client=gtx&sl=" + from + "&tl=" + to + "&dt=t&q=" + encodeURIComponent(text)
    if (corsProxy.includes("?")) raw_url = encodeURIComponent(raw_url)
    var url = corsProxy + raw_url
    fetch(url, {
        "method": "POST"
    }).then(function (req) {
        return req.text()
    }).then(function (json_string) {
        console.log(json_string)
        var data = JSON.parse(json_string)
        var translation = ""
        data[0].map((line) => {
            translation += line[0]
        })
        output.style.color = "#333"
        errorMessage.classList.add("d-none")
        output.classList.remove("d-none")
        output.innerText = translation
        var processingTime = Date.now() - start_time
        statsContainer.classList.remove("d-none")
        translationInfo.innerText = "Translated from: " + data[2] + ", to: " + to + " (" + processingTime + "ms)"
        loadingSpinner.classList.add("d-none")
        translateBtnIcon.classList.remove("d-none")

        translateBtn.disabled = false


    }).catch(function (e) {
        if (corsProxyIndex == corsProxies.length - 1) {
            retryBtn.classList.remove("d-none")
            output.classList.add("d-none")
            statsContainer.classList.add("d-none")
            errorMessage.classList.remove("d-none")
            loadingSpinner.classList.add("d-none")
            translateBtnIcon.classList.remove("d-none")

            console.log(e)
            translateBtn.disabled = false
            corsProxyIndex = 0
        }
        else {
            corsProxyIndex += 1
            var timeOffset = Date.now() - start_time
            doRequest(timeOffset)
        }
    })
}
export function tran() {
    if (document.getElementById('srctext').value) {

        loadingSpinner.classList.remove("d-none")
        retryBtn.classList.add("d-none")
        translateBtn.disabled = true
        output.style.color = "#808080"
        output.innerHTML = "Translating..."
        translateBtnIcon.classList.add("d-none")
        statsContainer.classList.add("d-none")
        doRequest()

    }
}