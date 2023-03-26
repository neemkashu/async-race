import { SERVER_ADDRESS } from '../utils/constants';
import { appendQueryToURL, RoundToDigits } from '../utils/helpers';
import {
    CustomEvents, ResponseStatuses, WinnerInfoMedium, WinnerInfoName, WinnerInfoShort
} from '../utils/types';
import { CarError } from './LoadErrors';
import Track from './Track';

export class TotalRaceKeeper {
    public winnerID: number | null = null;
    public winnerTime: number | null = null;
    public raceMembersAmount: number;
    public raceEndCount = 0;

    public constructor(public tracks: Track[]) {
        this.raceMembersAmount = tracks.length;
    }

    public initRace() {
        this.raceEndCount = 0;
        window.addEventListener(CustomEvents.FINISH, this, { once: true });
        window.addEventListener(CustomEvents.CAR_RACE_END, this);
        this.tracks.forEach((track) => {
            track.initCarRace();
        });
    }
    public handleEvent(event: Event) {
        if (event.type === CustomEvents.FINISH) {
            const finish = event as CustomEvent<WinnerInfoName | null>;
            if (!finish.detail) {
                return;
            }
            const winner: WinnerInfoShort = {
                id: finish.detail.id,
                time: finish.detail.time,
            };
            const { name } = finish.detail;
            this.showWinMessage(winner, name);
            this.writeRaceResult(winner)
                .then((winnerInfo) => {
                    const winnerEvent = new CustomEvent(CustomEvents.WINNER_FINISH, { detail: winner });
                    window.dispatchEvent(winnerEvent);
                })
                .catch((error) => {
                    console.warn('Some error when writing race result');
                });
            console.log('write or update winner', finish.detail.id, finish.detail.time);
        }
        if (event.type === CustomEvents.CAR_RACE_END) {
            this.raceEndCount += 1;
            // console.log('BUG WITH EXTRA LISTENERS this.raceEndCount', this.raceEndCount);
            const areAllCarsEndRace = this.raceEndCount === this.raceMembersAmount;
            if (areAllCarsEndRace) {
                const noWinner = new CustomEvent(CustomEvents.NO_ONE_FINISH);
                window.dispatchEvent(noWinner);
            }
        }
    }
    private showWinMessage(winner: WinnerInfoShort, name: string) {
        const message = document.createElement('div');
        const messageText = document.createElement('div');
        const timeToShow = RoundToDigits(winner.time);
        messageText.innerHTML = `${name} wins with ${timeToShow} s`;
        message.classList.add('message');
        messageText.classList.add('message__text');
        message.appendChild(messageText);
        document.body.appendChild(message);
        const timerId = setTimeout(() => {
            document.body.removeChild(message);
            clearTimeout(timerId);
        }, 1500);
    }
    private async writeRaceResult(winner: WinnerInfoShort) {
        const winnerInfo = await this.getWinnerInfo(winner.id);
        if (winnerInfo) {
            const bestTime = this.getBestTime(winner, winnerInfo);
            winnerInfo.wins += 1;
            winnerInfo.time = bestTime;
            this.updateWinner(winnerInfo);
        } else {
            const newWinner: WinnerInfoMedium = { ...winner, wins: 1 };
            this.createWinner(newWinner);
        }
        return winnerInfo;
    }
    private getBestTime(winnerNewInfo: WinnerInfoShort, winnerOldInfo: WinnerInfoMedium): number {
        const isNewTimeShorter = winnerNewInfo.time < winnerOldInfo.time;
        const bestTime = isNewTimeShorter ? winnerNewInfo.time : winnerOldInfo.time;
        return bestTime;
    }
    private async getWinnerInfo(id: number): Promise<WinnerInfoMedium | null> {
        try {
            const requestURL = `${SERVER_ADDRESS}/winners/${id}`;
            const options = {
                method: 'GET',
            };
            const response = await fetch(requestURL, options);
            if (!response.ok) {
                throw new CarError('Winner response not ok:', response.status, id);
            }
            const winner: WinnerInfoMedium = await response.json();
            return winner;
        } catch (error) {
            if (error instanceof CarError) {
                console.warn(error.message, error.id);
            }
            return null;
        }
    }
    private async createWinner(winner: WinnerInfoMedium): Promise<ResponseStatuses> {
        try {
            const requestURL = `${SERVER_ADDRESS}/winners`;
            const body = {
                id: winner.id,
                wins: winner.wins,
                time: winner.time,
            };
            const method = 'POST';
            const headers = new Headers();
            headers.append('Content-Type', 'application/json');
            const options = { method, body: JSON.stringify(body), headers };
            const response = await fetch(requestURL, options);
            if (!response.ok) {
                throw new CarError('Winner create response not ok:', response.status, winner.id);
            }
            return ResponseStatuses.SUCCESS;
        } catch (error) {
            if (error instanceof CarError) {
                console.warn(error.message, error.id);
            }
            return ResponseStatuses.ERROR;
        }
    }
    private async updateWinner(winner: WinnerInfoMedium): Promise<ResponseStatuses> {
        try {
            const requestURL = `${SERVER_ADDRESS}/winners/${winner.id}`;
            const body = {
                wins: winner.wins,
                time: winner.time,
            };
            const method = 'PUT';
            const headers = new Headers();
            headers.append('Content-Type', 'application/json');
            const options = { method, body: JSON.stringify(body), headers };
            const response = await fetch(requestURL, options);
            if (!response.ok) {
                throw new CarError('Winner update response not ok:', response.status, winner.id);
            }
            return ResponseStatuses.SUCCESS;
        } catch (error) {
            if (error instanceof CarError) {
                console.warn(error.message, error.id);
            }
            return ResponseStatuses.ERROR;
        }
    }
}
