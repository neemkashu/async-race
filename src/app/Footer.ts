import { FOOTER_TEMPLATE } from '../templates/templates';
import { makeElement } from '../utils/helpers';
import { MakeElementOptions } from '../utils/types';
import ViewComponent from './abstracts/ViewComponent';

class Footer extends ViewComponent {
    protected createContainer() {
        const options: MakeElementOptions = {
            tag: 'footer',
            class: 'footer',
            innerCode: FOOTER_TEMPLATE,
        };
        return makeElement(options);
    }
}
export default Footer;
