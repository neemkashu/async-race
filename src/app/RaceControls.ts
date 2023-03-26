import { getElementAndConvert, makeElement } from '../utils/helpers';
import { CustomEvents, RaceControlElements, RaceControlID } from '../utils/types';
import Component from './abstracts/Component';
import CommonInfo from './CommonInfo';

class RaceControls extends Component<RaceControlElements> {
    public constructor(public commonInfo: CommonInfo) {
        super();
        this.addListeners();
    }
    protected createIDs(): RaceControlID {
        const IDs: RaceControlID = {
            runRace: 'run-race-button',
            parkCars: 'park-all-cars-button',
            generate: 'generate-amount-of-cars-button'
        };
        return IDs;
    }
    protected getElements(): RaceControlElements {
        const elements = {
            runRace: getElementAndConvert(this.container, `#${this.elementsIDs.runRace}`, HTMLButtonElement),
            parkCars: getElementAndConvert(this.container, `#${this.elementsIDs.parkCars}`, HTMLButtonElement),
            generate: getElementAndConvert(this.container, `#${this.elementsIDs.generate}`, HTMLButtonElement),
        };
        return elements;
    }
    protected addListeners() {
        this.containerElements.runRace.addEventListener('click', this.initRace.bind(this));
        this.containerElements.parkCars.addEventListener('click', this.parkTheCars.bind(this));
        this.containerElements.generate.addEventListener('click', this.generateCars.bind(this));
        window.addEventListener(CustomEvents.ALL_PARKED, this.finishParking.bind(this));
        window.addEventListener(CustomEvents.FINISH, this.allowReset.bind(this));
        window.addEventListener(CustomEvents.NO_ONE_FINISH, this.allowReset.bind(this));
    }
    private initRace(event: Event) {
        const raceEvent = new Event(CustomEvents.RUN_RACE);
        this.blockRaceTimeButtons();
        window.dispatchEvent(raceEvent);
    }
    private parkTheCars(event: Event) {
        const parkEvent = new Event(CustomEvents.TO_PARK);
        const isDisabled = true;
        this.switchButtons(isDisabled);
        window.dispatchEvent(parkEvent);
    }
    private finishParking() {
        const isDisabled = false;
        this.switchButtons(isDisabled);
    }
    private allowReset() {
        const isDisabled = true;
        this.containerElements.parkCars.disabled = !isDisabled;
    }
    private blockRaceTimeButtons() {
        const isDisabled = true;
        this.switchButtons(isDisabled);
    }
    private switchButtons(isDisabled: boolean) {
        this.containerElements.runRace.disabled = isDisabled;
        this.containerElements.parkCars.disabled = isDisabled;
        this.containerElements.generate.disabled = isDisabled;
    }
    private generateCars(event: Event) {
        const manyCarEvent = new Event(CustomEvents.CREATE_MANY_CARS);
        window.dispatchEvent(manyCarEvent);
    }
    protected createContainer() {
        const options = {
            tag: 'div',
            class: 'race-controls',
            innerCode: this.getTemplate(),
        };
        return makeElement(options);
    }
    protected getTemplate(): string {
        return `
        <button class="race-button" id="${this.elementsIDs.runRace}">
        Race
        </button>
        <button class="reset-button" id="${this.elementsIDs.parkCars}">
        Reset
        </button>
        <button class="generate-button" id="${this.elementsIDs.generate}">
        Generate cars
        </button>`;
    }
}

export default RaceControls;
