let solution = {};
let visibleCells = [];

let startTime = null;
let timerHandle = null;

function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generatePuzzle() {

    let difficulty =
        document.getElementById("difficulty").value;

    let low, high;

    if (difficulty === "easy") {
        low = 1;
        high = 20;
    }
    else if (difficulty === "medium") {
        low = 10;
        high = 100;
    }
    else {
        low = 100;
        high = 999;
    }

    let a = rand(low, high);
    let b = rand(low, high);
    let c = rand(low, high);
    let d = rand(low, high);

    let r1 = a + b;
    let r2 = c + d;

    let c1 = a + c;
    let c2 = b + d;

    let G = r1 + r2;

    solution = {
        a, b, c, d,
        r1, r2,
        c1, c2,
        G
    };

    visibleCells = randomFourCells();

    renderBoard();

    startTime = new Date();

    if (timerHandle) {
        clearInterval(timerHandle);
    }

    timerHandle = setInterval(updateTimer, 1000);

    document.getElementById("message").innerHTML =
        "Puzzle generated. Fill the five blank cells.";
}

function randomFourCells() {

    const cells = [
        "a", "b", "c", "d",
        "r1", "r2",
        "c1", "c2",
        "G"
    ];

    let chosen = [];

    while (chosen.length < 4) {

        let cell =
            cells[rand(0, cells.length - 1)];

        if (!chosen.includes(cell)) {
            chosen.push(cell);
        }
    }

    return chosen;
}

function isVisible(name) {
    return visibleCells.includes(name);
}

function cell(name) {

    if (isVisible(name)) {
        return solution[name];
    }

    return `
        <input
            class="cell"
            id="${name}"
            type="number"
            min="1"
            step="1"
            inputmode="numeric">
    `;
}

function renderBoard() {

    document.getElementById("game").innerHTML = `

    <table class="game-table">

        <tr>
            <th></th>
            <th>C1</th>
            <th>C2</th>
            <th>Rt</th>
        </tr>

        <tr>
            <th>R1</th>
            <td>${cell("a")}</td>
            <td>${cell("b")}</td>
            <td>${cell("r1")}</td>
        </tr>

        <tr>
            <th>R2</th>
            <td>${cell("c")}</td>
            <td>${cell("d")}</td>
            <td>${cell("r2")}</td>
        </tr>

        <tr>
            <th>Ct</th>
            <td>${cell("c1")}</td>
            <td>${cell("c2")}</td>
            <td>${cell("G")}</td>
        </tr>

    </table>
    `;
}

function updateTimer() {

    if (!startTime) {
        return;
    }

    let seconds =
        Math.floor(
            (new Date() - startTime) / 1000
        );

    document.getElementById("timer").innerHTML =
        "⏱ " + seconds + " sec";
}

function getValue(name) {

    if (isVisible(name)) {
        return Number(solution[name]);
    }

    const input =
        document.getElementById(name);

    if (!input) {
        return null;
    }

    const value =
        Number(input.value);

    if (
        isNaN(value) ||
        value <= 0 ||
        !Number.isInteger(value)
    ) {
        return null;
    }

    return value;
}

function finishGame() {

    if (!startTime) {
        return;
    }

    const a = getValue("a");
    const b = getValue("b");
    const c = getValue("c");
    const d = getValue("d");

    const r1 = getValue("r1");
    const r2 = getValue("r2");

    const c1 = getValue("c1");
    const c2 = getValue("c2");

    const G = getValue("G");

    if (
        a === null ||
        b === null ||
        c === null ||
        d === null ||
        r1 === null ||
        r2 === null ||
        c1 === null ||
        c2 === null ||
        G === null
    ) {

        document.getElementById("message").innerHTML =
            "<span class='wrong'>Please enter positive integers in all blank cells.</span>";

        return;
    }

    let correct = true;

    /* Row totals */

    if (a + b !== r1) correct = false;
    if (c + d !== r2) correct = false;

    /* Column totals */

    if (a + c !== c1) correct = false;
    if (b + d !== c2) correct = false;

    /* Grand total */

    if (r1 + r2 !== G) correct = false;
    if (c1 + c2 !== G) correct = false;

    if (!correct) {

        document.getElementById("message").innerHTML =
            "<span class='wrong'>❌ Totals do not balance.</span>";

        return;
    }

    clearInterval(timerHandle);

    let elapsed =
        Math.floor(
            (new Date() - startTime) / 1000
        );

    let difficulty =
        document.getElementById("difficulty").value;

    let baseScore = 100;

    if (difficulty === "medium") {
        baseScore = 300;
    }

    if (difficulty === "hard") {
        baseScore = 600;
    }

    let largest =
        Math.max(
            a, b, c, d,
            r1, r2,
            c1, c2,
            G
        );

    let score =
        Math.max(
            0,
            baseScore +
            Math.floor(largest / 10) -
            Math.floor(elapsed / 2)
        );

    updateStats(score, elapsed);

    startTime = null;

    document.getElementById("message").innerHTML = `

        <span class="correct">
            ✅ Correct!
        </span>

        <br><br>

        All row totals, column totals and the grand total balance correctly.

        <br><br>

        Score:
        <b>${score}</b>

        <br>

        Time:
        ${elapsed} sec
    `;
}

function updateStats(score, elapsed) {

    let stats =
        JSON.parse(
            localStorage.getItem("findFiveStats")
        ) || {
            games: 0,
            bestScore: 0,
            fastest: null,
            totalScore: 0,
            totalTime: 0
        };

    stats.games++;
    stats.totalScore += score;
    stats.totalTime += elapsed;

    if (score > stats.bestScore) {
        stats.bestScore = score;
    }

    if (
        stats.fastest === null ||
        elapsed < stats.fastest
    ) {
        stats.fastest = elapsed;
    }

    localStorage.setItem(
        "findFiveStats",
        JSON.stringify(stats)
    );

    loadStats();
}

function loadStats() {

    const stats =
        JSON.parse(
            localStorage.getItem("findFiveStats")
        );

    if (!stats) {
        return;
    }

    const avgScore =
        Math.round(
            stats.totalScore / stats.games
        );

    const avgTime =
        Math.round(
            stats.totalTime / stats.games
        );

    document.getElementById("personalBest").innerHTML = `

        Highest Score:
        <b>${stats.bestScore}</b>

        <br><br>

        Fastest Solve:
        <b>${stats.fastest}</b> sec

        <br><br>

        Games Won:
        <b>${stats.games}</b>

        <br><br>

        Average Score:
        <b>${avgScore}</b>

        <br><br>

        Average Time:
        <b>${avgTime}</b> sec

    `;
}

function resetStats() {

    const ok =
        confirm(
            "Reset all personal statistics?"
        );

    if (!ok) {
        return;
    }

    localStorage.removeItem("findFiveStats");

    document.getElementById("personalBest").innerHTML =
        "No games completed yet.";
}

loadStats();