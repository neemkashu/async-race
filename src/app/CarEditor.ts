import {
    getElementAndConvert,
    getRandomCarName,
    getRandomColor,
    makeElement
} from '../utils/helpers';
import {
    CREATE_CARS_AMOUNT,
    EDIT_CAR, MAX_CAR_NAME, MIN_CAR_NAME, SERVER_ADDRESS
} from '../utils/constants';
import {
    CustomEvents, EditorElements, EditorID, EditorKey, ResponseStatuses
} from '../utils/types';
import CommonInfo from './CommonInfo';
import Component from './abstracts/Component';

function makeCarRedactorTemplate(editKey: keyof typeof EDIT_CAR, ID: EditorID) {
    const isCreateMode = editKey === 'create';

    const inputColorID = isCreateMode ? ID.newColor : ID.changeColor;
    const inputCarNameID = isCreateMode ? ID.newName : ID.changeName;
    const buttonCarID = isCreateMode ? ID.createButton : ID.changeButton;
    const enable = isCreateMode ? '' : 'disabled';

    const { placeholder, buttonCaption } = EDIT_CAR[editKey];
    const editTemplate = `
    <div class="car-redactor">
    <input
    ${enable}
    id="${inputCarNameID}"
    class="car-name"
    type="text"
    minLength="${MIN_CAR_NAME}"
    maxLength="${MAX_CAR_NAME}"
    placeholder="${placeholder}"
    value="${getRandomCarName()}"
    size="${MAX_CAR_NAME}">
    <input type="color"
    ${enable}
    class="car-color"
    value="${getRandomColor()}" id="${inputColorID}">
    <button
    ${enable}
    class="button-car-create"
    id="${buttonCarID}"
    >${buttonCaption}</button>
    </div>`;
    return editTemplate;
}
class CarEditor extends Component<EditorElements> {
    public constructor(public commonInfo: CommonInfo) {
        super();
        this.addListeners();
    }
    protected createIDs(): EditorID {
        const IDs: EditorID = {
            newName: 'new-car-name-field',
            newColor: 'new-color-field',
            createButton: 'create-button',
            changeName: 'change-name-field',
            changeColor: 'change-color-field',
            changeButton: 'change-button',
        };
        return IDs;
    }
    protected createContainer() {
        const options = {
            tag: 'div',
            class: 'car-editor',
            innerCode: this.makeCarEditorTemplate(),
        };
        return makeElement(options);
    }
    private makeCarEditorTemplate(): string {
        const editorTemplate = `${makeCarRedactorTemplate('create', this.elementsIDs)}
        ${makeCarRedactorTemplate('update', this.elementsIDs)}`;

        return editorTemplate;
    }
    protected getElements(): EditorElements {
        const elements = {
            newName: getElementAndConvert(this.container, `#${this.elementsIDs.newName}`, HTMLInputElement),
            newColor: getElementAndConvert(this.container, `#${this.elementsIDs.newColor}`, HTMLInputElement),
            createButton: getElementAndConvert(this.container, `#${this.elementsIDs.createButton}`, HTMLButtonElement),
            changeName: getElementAndConvert(this.container, `#${this.elementsIDs.changeName}`, HTMLInputElement),
            changeColor: getElementAndConvert(this.container, `#${this.elementsIDs.changeColor}`, HTMLInputElement),
            changeButton: getElementAndConvert(this.container, `#${this.elementsIDs.changeButton}`, HTMLButtonElement),
        };
        return elements;
    }
    private addListeners() {
        this.containerElements.createButton.addEventListener('click', this);
        this.containerElements.changeButton.addEventListener('click', this);
        window.addEventListener(CustomEvents.EDIT, this);
        window.addEventListener(CustomEvents.RUN_RACE, this);
        window.addEventListener(CustomEvents.TO_PARK, this);
        window.addEventListener(CustomEvents.CREATE_MANY_CARS, this.createNCars.bind(this));
    }
    private createNCars(event: Event, N = CREATE_CARS_AMOUNT): void {
        const sendedPromises = Array.from({ length: N }, (item) => {
            const name = getRandomCarName();
            const color = getRandomColor();
            const reponse = this.sendNewCar(name, color);
            return reponse;
        });
        Promise.allSettled(sendedPromises)
            .then(() => {
                this.refreshEditor();
                const refreshCarEvent = new Event(CustomEvents.GARAGE);
                window.dispatchEvent(refreshCarEvent);
            })
            .catch((error) => {
                console.warn('Some cars were not created');
            });
    }
    public handleEvent(event: Event) {
        if (event.target instanceof HTMLElement) {
            if (event.target.id === this.elementsIDs.createButton) {
                const nameFromField = this.containerElements.newName.value;
                const name = this.getValidCarName(nameFromField);
                const color = this.containerElements.newColor.value;
                const refreshCarEvent = new Event(CustomEvents.GARAGE);
                this.sendNewCar(name, color)
                    .then((responseStatus) => {
                        // in case of any code refresh the garage
                        this.refreshEditor();
                        window.dispatchEvent(refreshCarEvent);
                    })
                    .catch((error) => {
                        console.warn('send new car is not successful');
                    });
            }
            if (event.target.id === this.elementsIDs.changeButton) {
                const nameFromField = this.containerElements.changeName.value;
                const name = this.getValidCarName(nameFromField);
                const color = this.containerElements.changeColor.value;

                this.updateCar(name, color)
                    .then((responseStatus) => {
                        if (responseStatus === ResponseStatuses.SUCCESS) {
                            const isEditDisabled = true;
                            const updateCarEvent = new Event(CustomEvents.UPDATE_CAR);
                            this.commonInfo.carName = name;
                            this.commonInfo.carColor = this.containerElements.changeColor.value;
                            this.containerElements.createButton.disabled = !isEditDisabled;
                            this.switchEditFields(isEditDisabled);
                            window.dispatchEvent(updateCarEvent);
                        } else {
                            const isEditDisabled = true;
                            const refreshCarsEvent = new Event(CustomEvents.GARAGE);
                            this.containerElements.createButton.disabled = !isEditDisabled;
                            this.switchEditFields(isEditDisabled);
                            window.dispatchEvent(refreshCarsEvent);
                        }
                    }).catch((error) => {
                        console.warn('Edit car is not successful');
                    });
            }
        }
        const eventType = event.type;
        switch (eventType) {
        case CustomEvents.EDIT: {
            this.containerElements.changeName.value = this.commonInfo.carName;
            this.containerElements.changeColor.value = this.commonInfo.carColor;
            this.containerElements.createButton.disabled = true;
            const isEditDisabled = false;
            this.switchEditFields(isEditDisabled);
            break;
        }
        case CustomEvents.RUN_RACE: {
            const isEditDisabled = true;
            this.containerElements.createButton.disabled = isEditDisabled;
            break;
        }
        case CustomEvents.TO_PARK: {
            const isEditDisabled = false;
            this.containerElements.createButton.disabled = isEditDisabled;
            break;
        }
        default: {
            break;
        }
        }
    }
    private getValidCarName(nameFromField: string): string {
        const isValidName = nameFromField !== '';
        const name = isValidName ? nameFromField.slice(0, MAX_CAR_NAME) : getRandomCarName();
        return name;
    }
    private switchEditFields(isDisabled: boolean) {
        this.containerElements.changeName.disabled = isDisabled;
        this.containerElements.changeButton.disabled = isDisabled;
        this.containerElements.changeColor.disabled = isDisabled;
    }
    private refreshEditor() {
        this.containerElements.newName.value = getRandomCarName();
        this.containerElements.newColor.value = getRandomColor();
    }
    private async updateCar(name: string, color: string): Promise<ResponseStatuses> {
        try {
            const id = this.commonInfo.carID;
            if (!Number.isInteger(id)) {
                throw new Error(`Wrong id: ${this.commonInfo.carID}`);
            }
            const requestURL = `${SERVER_ADDRESS}/garage/${id}`;
            const body = {
                name,
                color,
            };
            const headers = new Headers();
            headers.append('Content-Type', 'application/json');
            const options = { method: 'PUT', body: JSON.stringify(body), headers };
            const response = await fetch(requestURL, options);
            if (!response.ok) {
                throw new Error('Cannot change car');
            }
            return ResponseStatuses.SUCCESS;
        } catch (error) {
            console.warn('Failed request while editing car');
            return ResponseStatuses.ERROR;
        }
    }
    private async sendNewCar(name: string, color: string): Promise<ResponseStatuses> {
        try {
            const requestURL = `${SERVER_ADDRESS}/garage`;
            const body = {
                name,
                color,
            };
            const headers = new Headers();
            headers.append('Content-Type', 'application/json');
            const options = { method: 'POST', body: JSON.stringify(body), headers };

            const response = await fetch(requestURL, options);
            if (!response.ok) {
                throw new Error('Cannot create car');
            }
            return ResponseStatuses.SUCCESS;
        } catch (error) {
            console.warn('Cannot create car');
            return ResponseStatuses.ERROR;
        }
    }
}

export default CarEditor;
