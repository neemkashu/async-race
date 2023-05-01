import { SERVER_ADDRESS } from '../utils/constants';
import {
    Car,
    CustomEvents,
    EngineStatus,
    RaceData,
    ResponseStatuses,
    TrackPictures,
    VelocityData,
    WinnerInfoName,
    WinnerInfoShort
} from '../utils/types';
import { CarError } from './LoadErrors';

export class RaceKeeper {
    public raceData: RaceData;
    public controller = new AbortController();
    public constructor(
        public car: Car,
        public svgElements: TrackPictures,
        public velocityData: VelocityData,
        public finishCarPosition: number,
    ) {
        this.raceData = {
            velocity: velocityData.velocity,
            expectedTime: this.getExpectedTime(velocityData.velocity, velocityData.distance),
            currentPosition: 0,
            isWinner: false,
            isEngineRun: true,
            startTime: -1,
            previousTimeStamp: 0,
        };
    }
    private getExpectedTime(velocity: number, distance: number): number {
        return distance / velocity;
    }
    public runTrackRace() {
        this.animateCarRace();
        this.switchToDriveMode()
            .then((responseStatus) => {
                const carEndRace = new CustomEvent(CustomEvents.CAR_RACE_END);
                window.dispatchEvent(carEndRace);

                const isDriveToStop = responseStatus === ResponseStatuses.ERROR;
                if (isDriveToStop) {
                    this.stopAnimation();
                } else {
                    const detail: WinnerInfoName = {
                        name: this.car.name,
                        id: this.car.id,
                        time: this.convertIntoSeconds(this.raceData.expectedTime)
                    };
                    const finish = new CustomEvent(CustomEvents.FINISH, { detail, bubbles: true });
                    this.svgElements.carPicture.dispatchEvent(finish);
                }
            })
            .catch((error) => {
                console.warn('Some error during car animation');
            });
    }
    private convertIntoSeconds(time: number): number {
        return time / 1000;
    }
    private animateCarRace() {
        window.requestAnimationFrame(this.renderDriving.bind(this));
    }
    private stopAnimation() {
        this.raceData.isEngineRun = false;
    }
    private renderDriving(timestamp: number) {
        // requestAnimationFrame  gives the timeStamp (DOMHighResTimeStamp)
        // to the callbaсk function as an argument
        let timePassed = 0;
        if (this.raceData.startTime === -1) {
            this.raceData.startTime = timestamp;
        } else {
            timePassed = timestamp - this.raceData.startTime;
        }
        const { previousTimeStamp } = this.raceData;
        const animationDuration = this.raceData.expectedTime;
        const passedFractionX = timePassed / animationDuration;
        const isDone = passedFractionX >= 1 || !this.raceData.isEngineRun;

        if (previousTimeStamp !== timestamp) {
            if (!isDone) {
                this.drawCarAtPosition(passedFractionX);
                this.raceData.currentPosition = this.getCoordinateFromFraction(passedFractionX);
            }
        }
        if (timePassed < animationDuration) {
            this.raceData.previousTimeStamp = timestamp;
            if (!isDone) {
                window.requestAnimationFrame(this.renderDriving.bind(this));
            }
        }
    }
    private drawCarAtPosition(passedFractionX: number) {
        const coordinateX = this.getCoordinateFromFraction(passedFractionX);
        const translateCode = `translate(${coordinateX}px,0px)`;
        this.svgElements.carPicture.style.transform = translateCode;
    }
    private getCoordinateFromFraction(fraction: number): number {
        const coordinate = this.finishCarPosition * fraction;
        return coordinate;
    }
    private async switchToDriveMode(): Promise<ResponseStatuses> {
        try {
            const { signal } = this.controller;
            const requestURL = new URL(`${SERVER_ADDRESS}/engine`);
            const parameters = requestURL.searchParams;
            parameters.append('id', `${this.car.id}`);
            parameters.append('status', EngineStatus.DRIVE);
            requestURL.search = parameters.toString();

            const options = { method: 'PATCH', signal };
            const response = await fetch(requestURL, options);
            if (!response.ok) {
                throw new CarError('Drive engine error', response.status, this.car.id);
            }
            const code = response.status;
            return ResponseStatuses.SUCCESS;
        } catch (error) {
            if (error instanceof CarError) {
                console.warn(error.message, error.code, error.id);
            }
            return ResponseStatuses.ERROR;
        }
    }
}
