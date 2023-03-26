class Component<ComponentElements> {
    public container: HTMLElement;
    public elementsIDs: Record<keyof ComponentElements, string>;
    public containerElements: ComponentElements;

    public constructor() {
        this.elementsIDs = this.createIDs();
        this.container = this.createContainer();
        this.containerElements = this.getElements();
    }

    public render(node: HTMLElement): void {
        node.appendChild(this.container);
    }
    protected createIDs(): Record<keyof ComponentElements, string> {
        throw new Error('Method not implemented.');
    }
    protected createContainer(): HTMLElement {
        throw new Error('Method not implemented.');
    }
    protected getElements(): ComponentElements {
        throw new Error('Method not implemented.');
    }
    protected getTemplate(): string {
        throw new Error('Method not implemented.');
    }
}

export default Component;
