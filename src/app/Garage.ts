import {
    CARS_PER_PAGE, DEFAULT_PAGE, MIN_TRACK_LENGTH, SERVER_ADDRESS
} from '../utils/constants';
import { appendQueryToURL, getElementAndConvert, makeElement } from '../utils/helpers';
import {
    Car, CustomEvents, GarageElements, GarageID, VelocityData
} from '../utils/types';
import Component from './abstracts/Component';
import CommonInfo from './CommonInfo';
import { TotalRaceKeeper } from './TotalRaceKeeper';
import Track from './Track';

class Garage extends Component<GarageElements> {
    private tracks: Track[];
    public tracksContainer: HTMLElement | null = null;
    private page = DEFAULT_PAGE;
    public totalCarsAmount = 0;
    public totalRaceKeeper: TotalRaceKeeper | null = null;

    public constructor(public commonInfo: CommonInfo) {
        super();
        this.tracks = this.createTracks([]);
    }
    protected createContainer(): HTMLElement {
        const options = {
            tag: 'section',
            class: 'garage',
            innerCode: this.makeGarageTemplate(),
        };
        return makeElement(options);
    }
    private createTracks(cars: Car[]): Track[] {
        const tracks: Track[] = [];
        cars.forEach((car) => {
            const track = new Track(car, this.getTrackLength(), this.commonInfo);
            tracks.push(track);
        });
        this.tracks = tracks;
        return tracks;
    }
    protected createIDs(): GarageID {
        const IDs: GarageID = {
            totalCarsAmount: 'total-cars-amount',
            garagePage: 'garage-page',
            previousPage: 'previous-page',
            nextPage: 'next-page',
        };
        return IDs;
    }
    private getTracksContainer(): void {
        this.tracksContainer = document.body.querySelector('.garage__tracks');
    }
    private renderTracks(): void {
        const node = this.tracksContainer;
        if (node) {
            this.tracks.forEach((track) => {
                node.appendChild(track.container);
            });
        }
    }
    public getServerData() {
        this.loadRaceCars()
            .then((carsData) => {
                this.handleCarGarageData(carsData);
                this.addListeners();
            })
            .catch((error) => {
                console.warn('Error in handle or listeners', error);
            });
        this.loadTotalCarsAmount()
            .then((totalCarsAmount) => {
                this.handleTotalCarsAmount(totalCarsAmount);
            })
            .catch((error) => {
                console.warn('Cannot render total amount', error);
            });
    }
    private handleTotalCarsAmount(totalCarsAmount: string | null) {
        // TODO: create a script for handling incoming null
        this.totalCarsAmount = Number(totalCarsAmount);
        if (this.containerElements.totalCarsAmount) {
            const amount = totalCarsAmount ?? '0';
            this.containerElements.totalCarsAmount.innerHTML = amount;
        } else {
            throw new Error('Cannot found car amount element!');
        }
    }
    protected getElements(): GarageElements {
        const elements: GarageElements = {
            totalCarsAmount: getElementAndConvert(
                this.container,
                `#${this.elementsIDs.totalCarsAmount}`,
                HTMLSpanElement
            ),
            garagePage: getElementAndConvert(this.container, `#${this.elementsIDs.garagePage}`, HTMLSpanElement),
            previousPage: getElementAndConvert(this.container, `#${this.elementsIDs.previousPage}`, HTMLButtonElement),
            nextPage: getElementAndConvert(this.container, `#${this.elementsIDs.nextPage}`, HTMLButtonElement),
        };
        // error returns if some key is absent so using assertion is valid
        // although there is no checking for extra keys
        return elements;
    }
    private async loadTotalCarsAmount(): Promise<string | null> {
        try {
            const requestURL = appendQueryToURL(
                '_limit',
                '7',
                `${SERVER_ADDRESS}/garage`
            );
            const options = { method: 'HEAD' };
            const response = await fetch(requestURL, options);
            if (!response.ok) {
                throw new Error('response not ok');
            }
            const allHeaders = response.headers;
            const totalCarCount = allHeaders.get('X-Total-Count');
            return totalCarCount;
        } catch (error) {
            console.warn('Cannot get amount');
            return null;
        }
    }
    public async loadRaceCars(): Promise<Car[]> {
        try {
            const requestURLpath = `${SERVER_ADDRESS}/garage`;
            const options = {
                method: 'GET',
            };
            let requestURL = appendQueryToURL('_page', `${this.page}`, requestURLpath);
            requestURL = appendQueryToURL('_limit', `${CARS_PER_PAGE}`, requestURL.href);
            const carsResponse = await fetch(requestURL, options);
            if (!carsResponse.ok) {
                throw new Error('response not ok');
            }
            const cars: Car[] = await carsResponse.json();
            return cars;
        } catch (error) {
            console.warn('Error, when running loadRaceCars', error);
            return [];
        }
    }
    private handleCarGarageData(carsData: Car[]) {
        this.containerElements.garagePage.innerHTML = `${this.page}`;
        this.getTracksContainer();
        if (!carsData.length && this.tracksContainer) {
            this.tracksContainer.innerHTML = 'No cars on this page. Create a car or change the page';
            return;
        }
        this.clearTracks();
        this.createTracks(carsData);
        this.renderTracks();
    }
    private addListeners() {
        window.addEventListener(CustomEvents.GARAGE, this);
        this.containerElements.previousPage.addEventListener('click', this);
        this.containerElements.nextPage.addEventListener('click', this);
        window.addEventListener(CustomEvents.RUN_RACE, this);
        this.tracksContainer?.addEventListener(CustomEvents.FINISH, this);
        window.addEventListener(CustomEvents.NO_ONE_FINISH, this);
        window.addEventListener(CustomEvents.TO_PARK, this);
    }
    public handleEvent(event: Event) {
        if (event.type === CustomEvents.GARAGE) {
            this.getServerData();
        }
        if (event.type === CustomEvents.RUN_RACE) {
            this.initRace();
        }
        if (event.type === CustomEvents.TO_PARK) {
            this.finishRace();
        }
        if (event.type === CustomEvents.TO_PARK) {
            this.parkAllCars();
        }
        if (event.target instanceof HTMLElement) {
            if (event.target.id === this.elementsIDs.nextPage) {
                this.nextPageEventHandler();
            }
            if (event.target.id === this.elementsIDs.previousPage) {
                this.previousPageEventHandler();
            }
        }
    }
    private initRace() {
        const isDisabled = true;
        this.switchPageButtonsState(isDisabled);
        this.totalRaceKeeper = new TotalRaceKeeper(this.tracks);
        this.totalRaceKeeper.initRace();
    }
    private finishRace() {
        const isDisabled = false;
        this.switchPageButtonsState(isDisabled);
    }
    private parkAllCars() {
        const allParked: Promise<VelocityData | null>[] = [];
        this.tracks.forEach((track) => {
            allParked.push(track.stopEngine());
        });
        const areAllParked = Promise.allSettled(allParked);
        areAllParked
            .then((data) => {
                const eventAllParked = new Event(CustomEvents.ALL_PARKED);
                window.dispatchEvent(eventAllParked);
            });
    }
    private switchPageButtonsState(isDisabled: boolean) {
        this.containerElements.nextPage.disabled = isDisabled;
        this.containerElements.previousPage.disabled = isDisabled;
    }
    private nextPageEventHandler() {
        const lastPage = Math.ceil(this.totalCarsAmount / CARS_PER_PAGE);
        const isNextPageExist = this.page < lastPage;
        if (isNextPageExist) {
            this.page += 1;
            this.refreshPage();
        }
    }
    private previousPageEventHandler() {
        const isPreviousPageExist = this.page > 1;
        if (isPreviousPageExist) {
            this.page -= 1;
            this.refreshPage();
        }
    }
    private refreshPage() {
        this.loadRaceCars()
            .then((carsData) => {
                this.handleCarGarageData(carsData);
            })
            .catch((error) => {
                console.warn('Error in handle or listeners', error);
            });
    }
    private clearTracks() {
        if (this.tracksContainer) {
            this.tracksContainer.innerHTML = '';
        } else {
            throw new Error('Track container does not exist! Create new track container');
        }
    }
    private getTrackLength() {
        const DECORATIVE_GAP = 80;
        const windowSize = document.body.offsetWidth;
        return Math.max(windowSize - DECORATIVE_GAP, MIN_TRACK_LENGTH);
    }
    private makeGarageTemplate() {
        const garageTemplate = `
        <h1 class="garage__header">
        Garage (<span id="${this.elementsIDs.totalCarsAmount}"></span>)
        </h1>
        <div class="garage__page-control">
            <h2 class="garage__page">
            Page #<span id="${this.elementsIDs.garagePage}">${this.page ?? 'Loading'}</span>
            </h2>
            <button id="${this.elementsIDs.previousPage}">◀</button>
            <button id="${this.elementsIDs.nextPage}">▶</button>
        </div>
        <div class="garage__tracks">
        </div>
        `;
        return garageTemplate;
    }
}
export default Garage;
