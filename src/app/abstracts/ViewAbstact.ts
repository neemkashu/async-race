abstract class ViewAbstract {
    public abstract container: HTMLElement;

    public abstract render(node: HTMLElement): void;

    protected abstract createContainer(): HTMLElement;
}

export default ViewAbstract;
