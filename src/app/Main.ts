import { makeElement } from '../utils/helpers';
import { MakeElementOptions } from '../utils/types';
import ViewComponent from './abstracts/ViewComponent';

class Main extends ViewComponent {
    protected createContainer(): HTMLElement {
        const options: MakeElementOptions = {
            tag: 'main',
            class: 'main',
            innerCode: '',
        };
        return makeElement(options);
    }
}
export default Main;
