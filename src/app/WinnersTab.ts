import { SERVER_ADDRESS, SORT_CAPTIONS, WINNERS_PER_PAGE } from '../utils/constants';
import {
    appendQueryToURL, getElementAndConvert, makeElement, RoundToDigits
} from '../utils/helpers';
import {
    Car,
    CustomEvents,
    PictureIDs,
    ResponseStatuses,
    SORT_OPTIONS,
    SORT_ORDER,
    WinnerElements,
    WinnerID,
    WinnerInfoMedium
} from '../utils/types';
import Component from './abstracts/Component';
import CommonInfo from './CommonInfo';
import { gerCarPictureSeparate } from './components/RacePicture';
import { CarError } from './LoadErrors';

class WinnersTab extends Component<WinnerElements> {
    private page = 1;
    public totalAmount = 0;
    public currentSort = SORT_OPTIONS.none;
    public sortOrder = SORT_ORDER.ascending;
    public constructor(public commonInfo: CommonInfo) {
        super();
        this.addListeners();
    }
    private addListeners() {
        window.addEventListener(CustomEvents.WINNER_FINISH, this);
        window.addEventListener(CustomEvents.DELETE_CAR, this);
        this.containerElements.winSort.addEventListener('click', this.sortClick.bind(this));
        this.containerElements.timeSort.addEventListener('click', this.sortClick.bind(this));
        this.containerElements.previousPage.addEventListener('click', this);
        this.containerElements.nextPage.addEventListener('click', this);
    }
    public handleEvent(event: Event) {
        if (event.type === CustomEvents.WINNER_FINISH) {
            this.refreshTable();
        }
        if (event.type === CustomEvents.DELETE_CAR) {
            const deleteEvent = event as CustomEvent<number>;
            this.deleteWinner(deleteEvent.detail)
                .then((response) => {
                    // refresh table in any case
                    this.refreshTable();
                });
        }
        if (event.target instanceof HTMLButtonElement) {
            if (event.target.id === this.elementsIDs.nextPage) {
                this.nextPageEventHandler();
            }
            if (event.target.id === this.elementsIDs.previousPage) {
                this.previousPageEventHandler();
            }
        }
    }
    private async deleteWinner(id: number): Promise<ResponseStatuses> {
        try {
            const requestURL = `${SERVER_ADDRESS}/winners/${id}`;
            const options = {
                method: 'DELETE',
            };
            const carsResponse = await fetch(requestURL, options);
            if (!carsResponse.ok) {
                throw new CarError('response not ok', carsResponse.status, id);
            }
            return ResponseStatuses.SUCCESS;
        } catch (error) {
            console.warn('Error when deleting winner');
            return ResponseStatuses.ERROR;
        }
    }
    private nextPageEventHandler() {
        const lastPage = Math.ceil(this.totalAmount / WINNERS_PER_PAGE);
        const isNextPageExist = this.page < lastPage;
        if (isNextPageExist) {
            this.page += 1;
            this.refreshTable();
        }
    }
    private previousPageEventHandler() {
        const isPreviousPageExist = this.page > 1;
        if (isPreviousPageExist) {
            this.page -= 1;
            this.refreshTable();
        }
    }
    private sortClick(event: Event) {
        const button = event.target;
        if (button instanceof HTMLButtonElement) {
            if (button.id === this.elementsIDs.winSort) {
                this.currentSort = SORT_OPTIONS.wins;
            }
            if (button.id === this.elementsIDs.timeSort) {
                this.currentSort = SORT_OPTIONS.time;
            }
            const isPrevoiusAcsending = this.sortOrder === SORT_ORDER.ascending;
            this.sortOrder = isPrevoiusAcsending ? SORT_ORDER.descending : SORT_ORDER.ascending;
            this.renderTableHead();
            this.loadWinCars()
                .then((carsData) => {
                    this.handleWinData(carsData);
                })
                .catch((error) => {
                    console.warn('Error in handle or listeners', error);
                });
        }
    }
    private renderTableHead() {
        const sort = this.currentSort;
        const isAscending = this.sortOrder === SORT_ORDER.ascending;
        switch (sort) {
        case SORT_OPTIONS.none: {
            this.containerElements.winSort.innerHTML = SORT_CAPTIONS.none;
            this.containerElements.timeSort.innerHTML = SORT_CAPTIONS.none;
            break;
        }
        case SORT_OPTIONS.wins: {
            this.containerElements.winSort.innerHTML = isAscending ? SORT_CAPTIONS.increase : SORT_CAPTIONS.decrease;
            this.containerElements.timeSort.innerHTML = SORT_CAPTIONS.none;
            break;
        }
        case SORT_OPTIONS.time: {
            this.containerElements.timeSort.innerHTML = isAscending ? SORT_CAPTIONS.increase : SORT_CAPTIONS.decrease;
            this.containerElements.winSort.innerHTML = SORT_CAPTIONS.none;
            break;
        }
        default:
            break;
        }
    }
    private refreshTable() {
        this.getServerData();
    }
    protected createIDs(): WinnerID {
        const IDs: WinnerID = {
            totalWinAmount: 'total-win-amount',
            winnerPage: 'current-win-page',
            previousPage: 'previous-page',
            nextPage: 'next-page',
            winSort: 'sort-by-win',
            timeSort: 'sort-by-time',
            tableBody: 'table-data-rows',
        };
        return IDs;
    }
    public getServerData() {
        this.loadWinCars()
            .then((carsData) => {
                this.handleWinData(carsData);
                // this.addListeners();
            })
            .catch((error) => {
                console.warn('Error in handle or listeners', error);
            });
        this.loadTotalWinnersAmount()
            .then((totalWinAmount) => {
                this.handleTotalWinAmount(totalWinAmount);
            })
            .catch((error) => {
                console.warn('Cannot render total amount', error);
            });
    }
    private handleWinData(winData: WinnerInfoMedium[]) {
        const { tableBody, winnerPage } = this.containerElements;
        winnerPage.innerHTML = `${this.page}`;
        if (!winData.length) {
            tableBody.innerHTML = 'No race winners yet!';
            return;
        }

        const rowsPromises = this.createDataRows(winData);
        const rowsLoaded = Promise.all(rowsPromises);
        rowsLoaded.then((rows) => {
            tableBody.innerHTML = '';
            rows.forEach((row) => {
                tableBody.appendChild(row);
            });
        });
    }
    private createDataRows(winData: WinnerInfoMedium[]): Promise<HTMLTableRowElement>[] {
        const rows = winData.map(async (winner) => {
            const car = await this.loadCar(winner.id);
            const row = this.makeRow(car, winner);
            return row;
        });
        return rows;
    }
    private async loadCar(id: number): Promise<Car | null> {
        try {
            const requestURL = `${SERVER_ADDRESS}/garage/${id}`;
            const options = {
                method: 'GET',
            };
            const carsResponse = await fetch(requestURL, options);
            if (!carsResponse.ok) {
                throw new Error('response not ok');
            }
            const car: Car = await carsResponse.json();
            return car;
        } catch (error) {
            console.warn('Error, when running loadRaceCars', error);
            return null;
        }
    }
    private async loadWinCars(): Promise<WinnerInfoMedium[]> {
        try {
            const requestURLpath = `${SERVER_ADDRESS}/winners`;
            const options = {
                method: 'GET',
            };
            let requestURL = appendQueryToURL('_page', `${this.page}`, requestURLpath);
            requestURL = appendQueryToURL('_limit', `${WINNERS_PER_PAGE}`, requestURL.href);
            requestURL = appendQueryToURL('_sort', this.currentSort, requestURL.href);
            requestURL = appendQueryToURL('_order', this.sortOrder, requestURL.href);
            const carsResponse = await fetch(requestURL, options);
            if (!carsResponse.ok) {
                throw new Error('Response not ok');
            }
            const winners: WinnerInfoMedium[] = await carsResponse.json();
            return winners;
        } catch (error) {
            console.warn('Error, when running loadWinCars', error);
            return [];
        }
    }
    private handleTotalWinAmount(totalAmount: string | null) {
        // TODO: create a script for handling incoming null
        this.totalAmount = Number(totalAmount);
        if (this.containerElements.totalWinAmount) {
            const amount = totalAmount ?? '0';
            this.containerElements.totalWinAmount.innerHTML = amount;
        } else {
            throw new Error('Cannot found wins amount element!');
        }
    }
    protected getElements(): WinnerElements {
        const elements: WinnerElements = {
            totalWinAmount: getElementAndConvert(
                this.container,
                `#${this.elementsIDs.totalWinAmount}`,
                HTMLSpanElement
            ),
            winnerPage: getElementAndConvert(this.container, `#${this.elementsIDs.winnerPage}`, HTMLSpanElement),
            previousPage: getElementAndConvert(this.container, `#${this.elementsIDs.previousPage}`, HTMLButtonElement),
            nextPage: getElementAndConvert(this.container, `#${this.elementsIDs.nextPage}`, HTMLButtonElement),
            winSort: getElementAndConvert(this.container, `#${this.elementsIDs.winSort}`, HTMLButtonElement),
            timeSort: getElementAndConvert(this.container, `#${this.elementsIDs.timeSort}`, HTMLButtonElement),
            tableBody: getElementAndConvert(this.container, `#${this.elementsIDs.tableBody}`, HTMLTableSectionElement),
        };
        // error returns if some key is absent so using assertion is valid
        // although there is no checking for extra keys
        return elements;
    }
    private async loadTotalWinnersAmount(): Promise<string | null> {
        try {
            const requestURL = appendQueryToURL(
                '_limit',
                '10',
                `${SERVER_ADDRESS}/winners`
            );
            const options = { method: 'HEAD' };
            const response = await fetch(requestURL, options);
            if (!response.ok) {
                throw new Error('response not ok');
            }
            const allHeaders = response.headers;
            const totalCount = allHeaders.get('X-Total-Count');
            return totalCount;
        } catch (error) {
            console.warn('Cannot get amount');
            return null;
        }
    }
    protected createContainer() {
        const options = {
            tag: 'div',
            class: 'winner-container',
            innerCode: this.makeTemplate(),
        };
        return makeElement(options);
    }
    private makeTemplate(): string {
        const template = `
    <div class="winner-table-container">
        <h1 class="garage__header">
            Winners (<span id="${this.elementsIDs.totalWinAmount}"></span>)
        </h1>
        <div class="garage__page-control">
            <h2 class="garage__page">
            Page #<span id="${this.elementsIDs.winnerPage}">${this.page}</span>
            </h2>
            <button id="${this.elementsIDs.previousPage}">◀</button>
            <button id="${this.elementsIDs.nextPage}">▶</button>
        </div>
        <table class="table-winners">
            <thead>
                <tr>
                    <th class="table-header">ID</th>
                    <th class="table-header">Car</th>
                    <th class="table-header">Name</th>
                    <th class="table-header">
                        Wins 🥇
                        <button id="${this.elementsIDs.winSort}">
                            ${SORT_CAPTIONS.none}
                        </button>
                    </th>
                    <th class="table-header">
                        Best time ⏲
                        (in seconds)
                        <button id="${this.elementsIDs.timeSort}">
                            ${SORT_CAPTIONS.none}
                        </button>
                    </th>
                </tr>
            </thead>
            <tbody id="${this.elementsIDs.tableBody}">
            </tbody>
        </table>
    </div>`;
        return template;
    }
    private makeRow(car: Car | null, winner: WinnerInfoMedium): HTMLTableRowElement {
        const rowElement = document.createElement('tr');
        if (!car) {
            return rowElement;
        }
        const timeInSeconds = RoundToDigits(winner.time);
        const pictureElementIDs: PictureIDs = {
            carPicture: `table-winner-picture-${winner.id}`,
            flagPicture: '',
            roadPicture: '',
        };
        const row = `
                <td>${car.id}</td>
                <td>${gerCarPictureSeparate(pictureElementIDs, car.color)}</td>
                <td>${car.name}</td>
                <td>${winner.wins}</td>
                <td>${timeInSeconds}</td>`;
        rowElement.innerHTML = row;
        return rowElement;
    }
}
export default WinnersTab;
