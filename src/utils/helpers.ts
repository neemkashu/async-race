import { CAR_NAMES, CAR_SUFFIX } from './carNames';
import { MakeElementOptions } from './types';

function makeElement(options: MakeElementOptions): HTMLElement {
    const element = document.createElement(options.tag);
    element.classList.add(options.class);
    element.innerHTML = options.innerCode;
    return element;
}
function hideNodes(nodes: HTMLElement[]): void {
    nodes.forEach((element) => {
        element.classList.add('hidden');
    });
}
function showNodes(nodes: HTMLElement[]): void {
    nodes.forEach((element) => {
        element.classList.remove('hidden');
    });
}
function appendQueryToURL(key: string, value: string, url: string): URL {
    const requestURL = new URL(url);
    const parameters = requestURL.searchParams;
    parameters.append(key, value);
    requestURL.search = parameters.toString();
    return requestURL;
}

function getRandomColor(): string {
    const digits = Array.from({ length: 10 }, (item, index) => index);
    const hexDigits = ['a', 'b', 'c', 'd', 'e', 'f'];
    const hexNumbers = [...digits, ...hexDigits];

    const randomRGB = Array(6).fill(0).map(() => {
        const randomIndex = Math.floor(Math.random() * 16);
        return hexNumbers[randomIndex];
    }).join('');
    return `#${randomRGB}`;
}
function getRandomCarName(): string {
    const indexMark = Math.floor(Math.random() * CAR_NAMES.length);
    const indexSuffix = Math.floor(Math.random() * CAR_SUFFIX.length);
    return `${CAR_NAMES[indexMark]} ${CAR_SUFFIX[indexSuffix]}`;
}

function convertInElement<newClassType extends Element>(
    element: Element,
    newClass: new () => newClassType
): newClassType {
    if (element instanceof newClass) {
        return element as newClassType;
    }
    throw new Error(`Not an ${newClass} element!`);
}

function getElementAndConvert<newClassType extends Element>(
    container: Element,
    id: string,
    newClass: new() => newClassType
) {
    const element = container.querySelector(id);
    if (element) {
        return convertInElement(element, newClass);
    }
    throw new Error('Cannot found element');
}
function RoundToDigits(n: number): number {
    const DIGITS = 3;
    let convert = n * 10 ** DIGITS;
    convert = Math.round(convert);
    return convert / (10 ** DIGITS);
}
export {
    makeElement,
    hideNodes,
    showNodes,
    appendQueryToURL,
    getRandomColor,
    getRandomCarName,
    convertInElement,
    getElementAndConvert,
    RoundToDigits
};
