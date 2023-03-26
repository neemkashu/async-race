/* eslint-disable no-shadow */
interface MakeElementOptions {
    tag: string;
    class: string;
    innerCode: string;
}
type EditorPlaceHolders = 'New car name' | 'Rename selected car';

interface Car {
    name: string;
    color: string;
    id: number;
}
interface TrackPictureData {
    trackLength: number;
    carColor: string;
}
export interface VelocityData {
    velocity: number;
    distance: number;
}
export interface WinnerInfoShort {
    id: number;
    time: number;
}
export interface WinnerInfoName extends WinnerInfoShort {
    name: string;
}
export interface WinnerInfoMedium extends WinnerInfoShort {
    wins: number;
}
export interface RaceData {
    velocity: number;
    expectedTime: number;
    currentPosition: number;
    isWinner: boolean;
    isEngineRun: boolean;
    startTime: number;
    previousTimeStamp: number;
}
export interface AnimationData {
    startTime: number;
    duration: number;
    previousTimeStamp: number;
    position: number
}

const GarageKeys = [
    'totalCarsAmount',
    'garagePage',
    'previousPage',
    'nextPage',
]as const;
export type GarageKey = typeof GarageKeys[number];
const EditorKeys = [
    'newName',
    'newColor',
    'createButton',
    'changeName',
    'changeColor',
    'changeButton',
]as const;
export type EditorKey = typeof EditorKeys[number];

export interface TrackPictures {
    carPicture: SVGElement;
    flagPicture: SVGElement;
    roadPicture: SVGElement;
}
export interface TrackElements {
    select: HTMLButtonElement,
    remove: HTMLButtonElement,
    trackPicture: HTMLDivElement,
    carName: HTMLSpanElement,
    start: HTMLButtonElement,
    stop: HTMLButtonElement,
}
export interface GarageElements {
    totalCarsAmount: HTMLSpanElement;
    garagePage: HTMLSpanElement;
    previousPage: HTMLButtonElement;
    nextPage: HTMLButtonElement;
}
export interface EditorElements {
    newName: HTMLInputElement;
    newColor: HTMLInputElement;
    createButton: HTMLButtonElement;
    changeName: HTMLInputElement;
    changeColor: HTMLInputElement;
    changeButton: HTMLButtonElement;
}
export interface HeaderElements {
    garage: HTMLButtonElement;
    winners: HTMLButtonElement;
}
export interface WinnerElements {
    totalWinAmount: HTMLSpanElement;
    winnerPage: HTMLSpanElement;
    previousPage: HTMLButtonElement;
    nextPage: HTMLButtonElement;
    winSort: HTMLButtonElement;
    timeSort: HTMLButtonElement;
    tableBody: HTMLTableSectionElement;
}
export interface RaceControlElements {
    runRace: HTMLButtonElement;
    parkCars: HTMLButtonElement;
    generate: HTMLButtonElement;
}
export type PictureIDs = Record<keyof TrackPictures, string>;
export type EditorID = Record<EditorKey, string>;
export type HeaderID = Record<keyof HeaderElements, string>;
export type WinnerID = Record<keyof WinnerElements, string>;
export type RaceControlID = Record<keyof RaceControlElements, string>;
export type GarageID = Record<GarageKey, string>;
export type TrackID = Record<keyof TrackElements, string>;

export const enum ResponseStatuses {
    SUCCESS = 'successful',
    ERROR = 'failed',
}
export enum CustomEvents {
    GARAGE = 'refreshCars',
    EDIT = 'editCar',
    UPDATE_CAR = 'updateCar',
    FINISH = 'finishCar',
    WINNER_FINISH = 'detecthWinner',
    ENGINE_ON = 'carEngineIsOn',
    CHANGE_TAB = 'changeTab',
    RUN_RACE = 'runRaceAll',
    TO_PARK = 'toParkAll',
    ALL_PARKED = 'allAreParked',
    DELETE_CAR = 'deleteCar',
    CAR_RACE_END = 'carRaceAnyEnd',
    NO_ONE_FINISH = 'raceWithNoWinner',
    CREATE_MANY_CARS = 'createSeveralCars',
}
export enum EngineStatus {
    DRIVE = 'drive',
    START = 'started',
    STOP = 'stopped',
}
export enum TrackButtonState {
    DRIVE,
    PARKED,
    PENDING,
    FINISH,
}
export enum SORT_OPTIONS {
    wins = 'wins',
    time = 'time',
    none = 'id'
}
export enum SORT_ORDER {
    ascending = 'ASC',
    descending = 'DESC',
}

export {
    MakeElementOptions,
    EditorPlaceHolders,
    Car,
    TrackPictureData,
};
