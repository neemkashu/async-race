/* eslint-disable indent */
import { SERVER_ADDRESS } from '../utils/constants';
import { appendQueryToURL, getElementAndConvert, makeElement } from '../utils/helpers';
import {
 Car,
 CustomEvents,
 EngineStatus,
 PictureIDs,
 TrackButtonState,
 TrackElements,
 TrackID,
 TrackPictures,
 VelocityData,
 ResponseStatuses
} from '../utils/types';
import CommonInfo from './CommonInfo';
import { getFinishForCar, getTrackSvg, SVG_IDS } from './components/RacePicture';
import { CarError } from './LoadErrors';
import { RaceKeeper } from './RaceKeeper';

class Track {
    public car: Car;
    public container: HTMLElement;
    public trackLength: number;
    public finishCarPosition: number;
    public trackElements: TrackElements;
    public trackIDs: TrackID;
    public pictureElementIDs: PictureIDs;
    public svgElements: TrackPictures;
    private raceKeeper: RaceKeeper | null;
    public constructor(car: Car, trackLength: number, public commonInfo: CommonInfo) {
        this.car = car;
        this.trackLength = trackLength;
        [this.trackIDs, this.pictureElementIDs] = this.createTrackIDs();
        this.container = this.createContainer();
        this.finishCarPosition = getFinishForCar(trackLength);
        this.trackElements = this.getTrackElements();
        this.svgElements = this.getSVGElements();
        this.raceKeeper = null;
        this.addListeners();
    }
    public createContainer(): HTMLElement {
        const options = {
            tag: 'div',
            class: 'track',
            innerCode: this.getTrackTemplate(),
        };
        return makeElement(options);
    }
    private createTrackIDs(): [TrackID, PictureIDs] {
        const trackIDs: TrackID = {
            select: `race-select-${this.car.id}`,
            remove: `race-remove-${this.car.id}`,
            trackPicture: `race-picture-track-${this.car.id}`,
            carName: `race-car-name-caption-${this.car.id}`,
            start: `race-start-${this.car.id}`,
            stop: `race-stop-${this.car.id}`,
        };
        const pictureElementIDs: PictureIDs = {
            carPicture: `${SVG_IDS.raceCarID}${this.car.id}`,
            flagPicture: `${SVG_IDS.flagID}${this.car.id}`,
            roadPicture: `${SVG_IDS.roadID}${this.car.id}`,
        };
        return [trackIDs, pictureElementIDs];
    }
    private addListeners() {
        this.trackElements.remove.addEventListener('click', this.removeCar.bind(this));
        this.trackElements.select.addEventListener('click', this.selectCar.bind(this));
        window.addEventListener(CustomEvents.UPDATE_CAR, this.redrawCar.bind(this));
        this.trackElements.start.addEventListener('click', this.initCarRace.bind(this));
        this.trackElements.stop.addEventListener('click', this.stopEngine.bind(this));
    }
    public stopEngine(event?: Event): Promise<VelocityData | null> {
        const velocityData = this.controlEngine(EngineStatus.STOP);
        this.raceKeeper?.controller.abort();
        velocityData
            .then((velocity) => {
                if (this.raceKeeper) {
                    this.raceKeeper.raceData.isEngineRun = false;
                }
                this.parkCar();
            })
            .catch((error) => {
                console.warn('Error when stopping car: ', this.car.id);
            });
        return velocityData;
    }
    private redrawCar(event: Event) {
        if (this.car.id === this.commonInfo.carID) {
            this.car.name = this.commonInfo.carName;
            this.car.color = this.commonInfo.carColor;
            this.trackElements.carName.innerHTML = this.car.name;
            const carColorPath = this.svgElements.carPicture.querySelector('#path844');
            if (carColorPath && carColorPath instanceof SVGPathElement) {
                carColorPath.style.fill = this.car.color;
            }
        }
    }
    private parkCar() {
        const coordinateX = 0;
        const translateCode = `translate(${coordinateX}px,0px)`;
        this.svgElements.carPicture.style.transform = translateCode;
        this.renderStartButtons();
    }
    public removeCar(event: Event) {
        this.deleteCar(this.car.id)
            .then((responseStatus) => {
                // redraw garage in any case of delete car
                const refreshCarsEvent = new Event(CustomEvents.GARAGE);
                window.dispatchEvent(refreshCarsEvent);
                const deleteCarEvent = new CustomEvent(CustomEvents.DELETE_CAR, { detail: this.car.id });
                window.dispatchEvent(deleteCarEvent);
            })
            .catch((error) => {
                console.warn('Something wrong after deletion of a car', error);
            });
    }
    public initCarRace() {
        this.disableAllButtons();
        this.controlEngine(EngineStatus.START)
            .then((velocityData) => {
                this.renderDriveButtons();
                if (velocityData) {
                    this.raceKeeper = new RaceKeeper(
                        this.car,
                        this.svgElements,
                        velocityData,
                        this.finishCarPosition,
                    );
                    this.raceKeeper.runTrackRace();
                }
            })
            .catch((error) => {
                console.warn('Error when starting engine');
            });
    }
    private async controlEngine(status: EngineStatus): Promise<VelocityData | null> {
        try {
            const requestURL = new URL(`${SERVER_ADDRESS}/engine`);
            const parameters = requestURL.searchParams;
            parameters.append('id', `${this.car.id}`);
            parameters.append('status', status);
            requestURL.search = parameters.toString();

            const options = { method: 'PATCH' };
            const response = await fetch(requestURL, options);
            if (!response.ok) {
                throw new CarError(`Engine ${status} error`, response.status, this.car.id);
            }
            const velocityData: VelocityData = await response.json();
            return velocityData;
        } catch (error) {
            if (error instanceof CarError) {
                console.warn(error.message, error.code, error.id);
            }
            return null;
        }
    }
    private renderTrackButtons(state: TrackButtonState) {
        const isStartDisabled = state !== TrackButtonState.PARKED;
        const isStopDisabled = state === TrackButtonState.PENDING
            || state === TrackButtonState.PARKED;
        const isSelectDisabled = state !== TrackButtonState.PARKED;
        const isRemoveDisabled = state !== TrackButtonState.PARKED;

        this.trackElements.start.disabled = isStartDisabled;
        this.trackElements.stop.disabled = isStopDisabled;
        this.trackElements.select.disabled = isSelectDisabled;
        this.trackElements.remove.disabled = isRemoveDisabled;
    }
    private renderFinishButtons(event: Event) {
        const state = TrackButtonState.FINISH;
        this.renderTrackButtons(state);
    }
    private renderStartButtons() {
        const state = TrackButtonState.PARKED;
        this.renderTrackButtons(state);
    }
    private renderDriveButtons() {
        const state = TrackButtonState.DRIVE;
        this.renderTrackButtons(state);
    }
    private disableAllButtons() {
        const state = TrackButtonState.PENDING;
        this.renderTrackButtons(state);
    }
    private selectCar(event: Event) {
        this.updateCommonInfo();
        const editEvent = new Event(CustomEvents.EDIT);
        window.dispatchEvent(editEvent);
    }
    private updateCommonInfo() {
        this.commonInfo.carID = this.car.id;
        this.commonInfo.carName = this.car.name;
        this.commonInfo.carColor = this.car.color;
    }
    private async deleteCar(id: number): Promise<ResponseStatuses> {
        try {
            if (!Number.isInteger(id)) {
                throw new Error(`Wrong id: ${this.commonInfo.carID}`);
            }
            const requestURL = `${SERVER_ADDRESS}/garage/${id}`;
            const options = { method: 'DELETE' };
            const response = await fetch(requestURL, options);
            if (!response.ok) {
                throw new CarError('Delete car error', 404, id);
            }
            return ResponseStatuses.SUCCESS;
        } catch (error) {
            if (error instanceof CarError) {
                console.warn(error.message, error.code, error.id);
            }
            return ResponseStatuses.ERROR;
        }
    }
    private getSVGElements(): TrackPictures {
        const elementsSVG = (Object.keys(this.pictureElementIDs) as Array<keyof TrackPictures>)
            .reduce<TrackPictures>((elements, key) => {
                const element = getElementAndConvert(this.container, `#${this.pictureElementIDs[key]}`, SVGElement);
                // eslint-disable-next-line no-param-reassign
                elements[key] = element;
            return elements;
        }, {} as TrackPictures);
        // error returns if some key is absent so using assertion is valid
        // although there is no checking for extra keys
        return elementsSVG;
    }
    private getTrackElements(): TrackElements {
        const elements = {
            select: getElementAndConvert(this.container, `#${this.trackIDs.select}`, HTMLButtonElement),
            remove: getElementAndConvert(this.container, `#${this.trackIDs.remove}`, HTMLButtonElement),
            trackPicture: getElementAndConvert(this.container, `#${this.trackIDs.trackPicture}`, HTMLDivElement),
            carName: getElementAndConvert(this.container, `#${this.trackIDs.carName}`, HTMLSpanElement),
            start: getElementAndConvert(this.container, `#${this.trackIDs.start}`, HTMLButtonElement),
            stop: getElementAndConvert(this.container, `#${this.trackIDs.stop}`, HTMLButtonElement),
        };
        return elements;
    }
    private getTrackTemplate(): string {
        const selectButtonID = this.trackIDs.select;
        const removeButtonID = this.trackIDs.remove;
        const trackPictureID = this.trackIDs.trackPicture;
        const carNameCaptionID = this.trackIDs.carName;
        const startButtonID = this.trackIDs.start;
        const stopButtonID = this.trackIDs.stop;

        const trackTemplate = `
        <div class="track__race">
            <div class="track__static-controls">
                <button class="race-select" id="${selectButtonID}">Select
                </button>
                <button class="race-remove" id="${removeButtonID}">Remove
                </button>
                <span class="race-car-name" id="${carNameCaptionID}">
                ${this.car.name}</span>
            </div>
            <div class="track__race-controls">
                <div class="track__race-buttons">
                    <button
                        class="race-start"
                        id="${startButtonID}">
                        A
                    </button>
                    <button
                        class="race-stop"
                        id="${stopButtonID}"
                        disabled>
                        B
                    </button>
                </div>
                <div class="race-picture" id="${trackPictureID}">
                ${getTrackSvg(
                    {
                        trackLength: this.trackLength,
                        carColor: this.car.color,
                    },
                    this.pictureElementIDs
                )}
                </div>
            </div>
        </div>`;
        return trackTemplate;
    }
}
export default Track;
