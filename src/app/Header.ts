import { HeaderTabs } from '../utils/constants';
import { getElementAndConvert, makeElement } from '../utils/helpers';
import {
    CustomEvents, HeaderElements, HeaderID, MakeElementOptions
} from '../utils/types';
import Component from './abstracts/Component';
import CommonInfo from './CommonInfo';

class Header extends Component<HeaderElements> {
    public constructor(public commonInfo: CommonInfo, public tab: HeaderTabs) {
        super();
        this.tab = tab;
        this.addListeners();
    }
    protected createIDs(): HeaderID {
        const IDs: HeaderID = {
            garage: 'button-to-garage',
            winners: 'button-to-winners',
        };
        return IDs;
    }
    protected getTemplate(): string {
        return `
        <button class="button__garage" id="${this.elementsIDs.garage}">
            To garage
        </button>
        <button class="button__winners" id="${this.elementsIDs.winners}">
            To winners
        </button>`;
    }
    protected createContainer(): HTMLElement {
        const options: MakeElementOptions = {
            tag: 'header',
            class: 'header',
            innerCode: this.getTemplate(),
        };
        return makeElement(options);
    }
    protected getElements(): HeaderElements {
        const elements = {
            garage: getElementAndConvert(this.container, `#${this.elementsIDs.garage}`, HTMLButtonElement),
            winners: getElementAndConvert(this.container, `#${this.elementsIDs.winners}`, HTMLButtonElement),
        };
        return elements;
    }
    protected addListeners() {
        this.containerElements.garage.addEventListener('click', this.changeToGarage.bind(this));
        this.containerElements.winners.addEventListener('click', this.changeToWinners.bind(this));
    }
    protected changeToGarage(event: Event) {
        if (this.tab === HeaderTabs.WINNERS) {
            this.tab = HeaderTabs.GARAGE;
            const changeTabEvent = new Event(CustomEvents.CHANGE_TAB);
            this.container.dispatchEvent(changeTabEvent);
        }
    }
    protected changeToWinners(event: Event) {
        if (this.tab === HeaderTabs.GARAGE) {
            this.tab = HeaderTabs.WINNERS;
            const changeTabEvent = new Event(CustomEvents.CHANGE_TAB);
            this.container.dispatchEvent(changeTabEvent);
        }
    }
}

export default Header;
