import { HeaderTabs } from '../utils/constants';
import { hideNodes, showNodes } from '../utils/helpers';
import CarEditor from './CarEditor';
import Footer from './Footer';
import Garage from './Garage';
import Header from './Header';
import Main from './Main';
import RaceControls from './RaceControls';
import WinnersTab from './WinnersTab';
import CommonInfo from './CommonInfo';
import { CustomEvents } from '../utils/types';

class Game {
    private currentTab = HeaderTabs.GARAGE;
    private header: Header;
    private main: Main;
    private carEditor: CarEditor;
    private raceControls: RaceControls;
    private garage: Garage;
    private commonInfo: CommonInfo;
    private footer: Footer;
    private winnersTab: WinnersTab;

    public constructor() {
        this.commonInfo = new CommonInfo();
        this.main = new Main();
        this.footer = new Footer();

        this.header = new Header(this.commonInfo, this.currentTab);
        this.carEditor = new CarEditor(this.commonInfo);
        this.raceControls = new RaceControls(this.commonInfo);
        this.garage = new Garage(this.commonInfo);
        this.winnersTab = new WinnersTab(this.commonInfo);
    }

    public initGame() {
        this.renderContainers();
        this.showPageContent();
        this.addListeners();
        this.showRaceCars();
        this.showWinners();
    }
    private addListeners() {
        this.header.container.addEventListener(CustomEvents.CHANGE_TAB, this);
    }
    public handleEvent(event: Event) {
        this.currentTab = this.header.tab;
        this.showPageContent();
    }
    private renderContainers() {
        this.header.render(document.body);
        this.main.render(document.body);
        this.footer.render(document.body);
        this.carEditor.render(this.main.container);
        this.raceControls.render(this.main.container);
        this.garage.render(this.main.container);
        this.winnersTab.render(this.main.container);
    }
    public showPageContent(): void {
        const elementsWinnerTab = [this.winnersTab.container];
        const elementsGarageTab = [
            this.carEditor.container,
            this.raceControls.container,
            this.garage.container,
        ];
        const isGarageTab = this.currentTab === HeaderTabs.GARAGE;
        const contentToHide = isGarageTab ? elementsWinnerTab : elementsGarageTab;
        const contentToShow = isGarageTab ? elementsGarageTab : elementsWinnerTab;

        hideNodes(contentToHide);
        showNodes(contentToShow);
    }
    public showRaceCars(): void {
        this.garage.getServerData();
    }
    public showWinners(): void {
        this.winnersTab.getServerData();
    }
}

export default Game;
