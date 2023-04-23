// eslint-disable-next-line no-shadow
export enum HeaderTabs {
    GARAGE,
    WINNERS,
}
const SERVER_ADDRESS = 'https://glowing-inconclusive-caravel.glitch.me';
const MAX_CAR_NAME = 30;
const MIN_CAR_NAME = 1;
const DEFAULT_TRACK_LENGTH = 300;
const MIN_TRACK_LENGTH = 400;
const CARS_PER_PAGE = 7;
const WINNERS_PER_PAGE = 10;
const DEFAULT_PAGE = 1;
const CREATE_CARS_AMOUNT = 100;

const EDIT_CAR = {
    create: {
        buttonCaption: 'Create',
        placeholder: 'New car name',
    },
    update: {
        buttonCaption: 'Update',
        placeholder: 'Change car name',
    },
};
const SORT_CAPTIONS = {
    increase: '⬆',
    decrease: '⬇',
    none: '-'
};

export {
    SERVER_ADDRESS,
    MAX_CAR_NAME,
    MIN_CAR_NAME,
    EDIT_CAR,
    DEFAULT_TRACK_LENGTH,
    MIN_TRACK_LENGTH,
    CARS_PER_PAGE,
    DEFAULT_PAGE,
    SORT_CAPTIONS,
    WINNERS_PER_PAGE,
    CREATE_CARS_AMOUNT
};
