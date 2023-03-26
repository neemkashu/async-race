import ViewAbstract from './ViewAbstact';

class ViewComponent extends ViewAbstract {
    public container: HTMLElement;
    public constructor() {
        super();
        this.container = this.createContainer();
    }
    public render(node: HTMLElement): void {
        node.appendChild(this.container);
    }
    protected createContainer(): HTMLElement {
        throw new Error('Method not implemented.');
    }
}

export default ViewComponent;
