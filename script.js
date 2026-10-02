const display = document.getElementById("display");
const history = document.getElementById("history");

const historyPanel = document.getElementById("historyPanel");
const historyList = document.getElementById("historyList");

let expression = "";

let calculationHistory =
    JSON.parse(localStorage.getItem("calculatorHistory")) || [];


// =========================
// PREMIUM SOUND SYSTEM
// =========================

let audioContext;

let soundEnabled =
    localStorage.getItem("calculatorSound") !== "off";


function playSound(type = "click") {

    if (!soundEnabled) return;

    if (!audioContext) {
        audioContext =
            new (window.AudioContext ||
            window.webkitAudioContext)();
    }

    if (audioContext.state === "suspended") {
        audioContext.resume();
    }

    const now = audioContext.currentTime;

    const oscillator =
        audioContext.createOscillator();

    const gain =
        audioContext.createGain();

    oscillator.connect(gain);
    gain.connect(audioContext.destination);


    if (type === "equal") {

        // Premium rising confirmation sound
        oscillator.type = "sine";

        oscillator.frequency.setValueAtTime(
            420,
            now
        );

        oscillator.frequency.exponentialRampToValueAtTime(
            760,
            now + 0.13
        );

        gain.gain.setValueAtTime(
            0.0001,
            now
        );

        gain.gain.exponentialRampToValueAtTime(
            0.06,
            now + 0.025
        );

        gain.gain.exponentialRampToValueAtTime(
            0.0001,
            now + 0.18
        );

        oscillator.start(now);

        oscillator.stop(now + 0.18);

    } else if (type === "delete") {

        // Soft lower click
        oscillator.type = "triangle";

        oscillator.frequency.setValueAtTime(
            260,
            now
        );

        gain.gain.setValueAtTime(
            0.04,
            now
        );

        gain.gain.exponentialRampToValueAtTime(
            0.0001,
            now + 0.07
        );

        oscillator.start(now);

        oscillator.stop(now + 0.07);

    } else {

        // Normal soft button click
        oscillator.type = "sine";

        oscillator.frequency.setValueAtTime(
            500,
            now
        );

        oscillator.frequency.exponentialRampToValueAtTime(
            350,
            now + 0.045
        );

        gain.gain.setValueAtTime(
            0.035,
            now
        );

        gain.gain.exponentialRampToValueAtTime(
            0.0001,
            now + 0.06
        );

        oscillator.start(now);

        oscillator.stop(now + 0.06);
    }
}


// =========================
// DISPLAY
// =========================

function updateDisplay() {

    display.value =
        expression || "0";

    // Keep newest number visible
    display.scrollLeft =
        display.scrollWidth;
}


// =========================
// NORMAL CALCULATOR
// =========================

function addValue(value) {

    if (expression === "Error") {
        expression = "";
    }

    expression += value;

    updateDisplay();
}


function clearDisplay() {

    expression = "";

    history.textContent = "";

    updateDisplay();

    playSound("delete");
}


function deleteLast() {

    if (expression === "Error") {
        expression = "";
    } else {
        expression =
            expression.slice(0, -1);
    }

    updateDisplay();

    playSound("delete");
}


function percentage() {

    try {

        if (!expression) return;

        const result = Function(
            '"use strict"; return (' +
            expression +
            ')'
        )();

        expression =
            String(result / 100);

        updateDisplay();

        playSound();

    } catch {

        expression = "Error";

        updateDisplay();
    }
}


function calculate() {

    if (!expression) return;

    try {

        const original =
            expression;

        const result = Function(
            '"use strict"; return (' +
            expression +
            ')'
        )();

        if (!Number.isFinite(result)) {
            throw new Error();
        }

        history.textContent =
            original + " =";


        calculationHistory.unshift({

            question: original,

            answer: result

        });


        if (
            calculationHistory.length > 10
        ) {

            calculationHistory.pop();

        }


        localStorage.setItem(
            "calculatorHistory",
            JSON.stringify(
                calculationHistory
            )
        );


        expression =
            String(result);

        updateDisplay();

        showHistory();

        playSound("equal");

    } catch {

        history.textContent = "";

        expression = "Error";

        updateDisplay();

        playSound("delete");
    }
}


// =========================
// SCIENTIFIC CALCULATOR
// =========================

function scientific(type) {

    if (
        !expression ||
        expression === "Error"
    ) {
        return;
    }


    try {

        const number =
            Number(expression);


        if (!Number.isFinite(number)) {
            throw new Error();
        }


        if (type === "sqrt") {

            if (number < 0) {
                throw new Error();
            }

            expression =
                String(Math.sqrt(number));
        }


        else if (type === "square") {

            expression =
                String(number * number);
        }


        else if (type === "power") {

            expression += "**";
        }


        else if (type === "pi") {

            expression =
                String(Math.PI);
        }


        else if (type === "sin") {

            expression =
                String(
                    Math.sin(
                        number *
                        Math.PI / 180
                    )
                );
        }


        else if (type === "cos") {

            expression =
                String(
                    Math.cos(
                        number *
                        Math.PI / 180
                    )
                );
        }


        else if (type === "tan") {

            expression =
                String(
                    Math.tan(
                        number *
                        Math.PI / 180
                    )
                );
        }


        else if (type === "log") {

            if (number <= 0) {
                throw new Error();
            }

            expression =
                String(Math.log10(number));
        }


        updateDisplay();

        playSound();

    } catch {

        expression = "Error";

        updateDisplay();

        playSound("delete");
    }
}


// =========================
// SCIENTIFIC MODE
// =========================

function toggleScientific() {

    const scientificButtons =
        document.querySelector(
            ".scientific-buttons"
        );

    const modeButton =
        document.querySelector(
            ".mode-btn"
        );


    scientificButtons.classList.toggle(
        "show"
    );

    modeButton.classList.toggle(
        "active"
    );

    playSound();
}


// =========================
// HISTORY
// =========================

function toggleHistory() {

    historyPanel.classList.toggle(
        "show"
    );


    if (
        historyPanel.classList.contains(
            "show"
        )
    ) {

        showHistory();

    }

    playSound();
}


function showHistory() {

    if (
        calculationHistory.length === 0
    ) {

        historyList.innerHTML =
            '<p class="empty-history">' +
            'No calculations yet' +
            '</p>';

        return;
    }


    historyList.innerHTML = "";


    calculationHistory.forEach(
        function(item) {

            const div =
                document.createElement(
                    "div"
                );

            div.className =
                "history-item";


            div.innerHTML = `

                <div class="history-question">
                    ${item.question} =
                </div>

                <div class="history-answer">
                    ${item.answer}
                </div>

            `;


            historyList.appendChild(div);
        }
    );
}


function clearHistory() {

    calculationHistory = [];

    localStorage.removeItem(
        "calculatorHistory"
    );

    showHistory();

    playSound("delete");
}


// =========================
// DARK / LIGHT THEME
// =========================

function toggleTheme() {

    document.body.classList.toggle(
        "light"
    );


    const themeButton =
        document.querySelector(
            ".theme-btn"
        );


    if (
        document.body.classList.contains(
            "light"
        )
    ) {

        themeButton.textContent = "🌙";

        localStorage.setItem(
            "calculatorTheme",
            "light"
        );

    } else {

        themeButton.textContent = "☀️";

        localStorage.setItem(
            "calculatorTheme",
            "dark"
        );
    }


    playSound();
}


// =========================
// SOUND TOGGLE
// =========================

function toggleSound() {

    soundEnabled =
        !soundEnabled;


    const soundButton =
        document.querySelector(
            ".sound-btn"
        );


    if (soundEnabled) {

        soundButton.textContent = "🔊";

        localStorage.setItem(
            "calculatorSound",
            "on"
        );

        playSound();

    } else {

        soundButton.textContent = "🔇";

        localStorage.setItem(
            "calculatorSound",
            "off"
        );
    }
}


// =========================
// KEYBOARD
// =========================

document.addEventListener(
    "keydown",
    function(event) {

        const key = event.key;


        if (
            (key >= "0" &&
                key <= "9") ||
            key === "+" ||
            key === "-" ||
            key === "*" ||
            key === "/" ||
            key === "."
        ) {

            addValue(key);

            playSound();
        }


        else if (
            key === "Enter" ||
            key === "="
        ) {

            calculate();
        }


        else if (
            key === "Backspace"
        ) {

            deleteLast();
        }


        else if (
            key === "Escape"
        ) {

            clearDisplay();
        }


        else if (
            key === "%"
        ) {

            percentage();
        }
    }
);


// =========================
// BUTTON SOUND
// =========================

// Only buttons that DON'T already
// have their own sound get a click.

document
    .querySelectorAll(
        ".buttons button, .scientific-buttons button"
    )
    .forEach(
        function(button) {

            button.addEventListener(
                "click",
                function() {

                    const text =
                        button.textContent.trim();

                    if (
                        text === "=" ||
                        text === "AC" ||
                        text === "⌫"
                    ) {
                        return;
                    }

                    playSound();
                }
            );
        }
    );


// =========================
// LOAD SETTINGS
// =========================

const savedTheme =
    localStorage.getItem(
        "calculatorTheme"
    );


const themeButton =
    document.querySelector(
        ".theme-btn"
    );


if (savedTheme === "light") {

    document.body.classList.add(
        "light"
    );

    themeButton.textContent = "🌙";

} else {

    themeButton.textContent = "☀️";
}


const soundButton =
    document.querySelector(
        ".sound-btn"
    );


if (soundEnabled) {

    soundButton.textContent = "🔊";

} else {

    soundButton.textContent = "🔇";
}


// =========================
// START
// =========================

updateDisplay();

showHistory();