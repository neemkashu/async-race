const HEADER_TEMPLATE = `
<button class="button__garage">
    To garage
</button>
<button class="button__winners">
    To winners
</button>`;

const FOOTER_TEMPLATE = `<p class="footer__year">2023</p>
<a href="https://github.com/neemkashu" class="footer__github">neemkashu</a>
<a href="https://rs.school/js/" class="footer__logo"></a>`;

const MAIN = `<main class="main">
</main>`;

const RACE_BUTTONS = `
<button class="race-button">
Race
</button>
<button class="reset-button">
Reset
</button>
<button class="generate-button">
Generate cars
</button>`;

const GARAGE = `
<h1 class="garage__header">
Garage (4)
</h1>
<h2 class="garage__page">
Page #1
</h2>
<div class="garage__tracks">
</div>`;

const TRACK = `
<div class="track__race">
<div class="race-controls">
    <button class="race-start">
        Go!
    </button>
    <button class="race-stop">
        Stop!
    </button>
</div>
<div class="race-picture">
</div>
</div>`;

export function getCarColoredPath(color: string): string {
    return `
    <path id="path844" d="M4.22608 12.6365H2.81738V12.5583C2.81738 12.389 2.85651 12.2262
    2.93477 12.07C3.01301 11.9007 3.11735 11.7575 3.2478 11.6403C3.37824 11.5101 3.52824
    11.4124 3.6978 11.3474C3.85432 11.2693 4.01736 11.2302 4.18693
    11.2302H14.0674V4.19901H11.9543L12.6587 2.79279H29.5239L30.2282
    4.19901H23.9087V11.2302H29.5239V12.6365H30.9326V11.2302H40.7739C41.1652
    11.2302 41.4978 11.3669 41.7717 11.6404C42.0457 11.9138 42.1826 12.2459
    42.1826 12.6365H40.7739V15.4295H42.1826V19.6483H37.7217C37.5783 19.2316
    37.3761 18.8474 37.1152 18.4959C36.8413 18.1573 36.5283 17.8644 36.1761
    17.617C35.8239 17.3696 35.4457 17.1807 35.0413 17.0506C34.6239 16.9075
    34.1935 16.8359 33.75 16.8359C33.3065 16.8359 32.8826 16.9075 32.4783
    17.0506C32.0609 17.1808 31.6761 17.3697 31.3239 17.617C30.9717 17.8645
    30.6652 18.1574 30.4043 18.4959C30.1304 18.8474 29.9217 19.2316 29.7783
    19.6483H13.8326C13.6761 19.2316 13.4674 18.8474 13.2065 18.4959C12.9326 18.1573 12.6261
    17.8644 12.287 17.617C11.9348 17.3696 11.5565 17.1807 11.1522 17.0506C10.7348 16.9075 10.2978
    16.8359 9.8413 16.8359C9.39782 16.8359 8.97391 16.9075 8.56956 17.0506C8.15217 17.1808 7.76739
    17.3697 7.41522 17.617C7.06304 17.8645 6.75652 18.1574 6.49565 18.4959C6.22174 18.8474 6.01305
    19.2316 5.86957 19.6483H2.81739V15.4295H4.22608L4.22608 12.6365Z" fill="${color}"></path>`;
}

export {
    HEADER_TEMPLATE, FOOTER_TEMPLATE, MAIN, RACE_BUTTONS, GARAGE, TRACK
};
