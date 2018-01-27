import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';
import { Link } from './link';
import { Logger } from '../../util/log';
import { Navbaritem } from './navbaritem';

import './navbar.scss';

function nestedSort(array, comparison) {
    array.sort(comparison);

    for (let item of array) {
        if (item.items != null) {
            nestedSort(item.items, comparison);
        }
    }
}

@Component({
    template: require('./navbar.html'),
    components: { 'navbaritem': Navbaritem }
})
export class NavbarComponent extends Vue {
    protected logger: Logger;

    inverted: boolean = true; // default value

    object: { default: string } = { default: 'Default object property!' }; // objects as default values don't need to be wrapped into functions

    private self;
    links: Link[] = [];
    menus: any[] = [];

    @Watch('$route.path')
    pathChanged() {
        // this.logger.info('Changed current path to: ' + this.$route.path);
    }

    mounted() {
        // if (!this.logger) this.logger = new Logger();
        // this.$nextTick(() => this.logger.info(this.object.default));
        this.links.push(new Link('Home', '/#/'));
        this.links.push(new Link('About', '/#/about'));

        this.$nextTick(() => {
            let app = this.$root.$data._app;
            let tree = [];

            tree.push({ label: 'Home', url: '/#/', orderIndex: 0 });
            tree.push({ label: 'About', url: '/#/about', orderIndex: 1 });

            for (let form of app.forms) {
                if (form.customProperties != null) {
                    let formMenu = app.getMenu(form.customProperties.menu);

                    if (formMenu != null) {
                        let currentFolder = {
                            items: tree
                        };

                        if (formMenu.name !== '') {
                            let path = formMenu.name.split('/');

                            for (let folder of path) {
                                let subfolder = currentFolder.items.find(t => t.id === folder);

                                if (subfolder == null) {
                                    subfolder = {
                                        id: folder,
                                        orderIndex: formMenu.orderIndex,
                                        items: []
                                    };

                                    currentFolder.items.push(subfolder);
                                    currentFolder = subfolder;
                                }
                                else {
                                    currentFolder = subfolder;
                                }
                            }
                        }

                        currentFolder.items.push({
                            label: form.label,
                            url: app.makeUrl(form.id),
                            // Make sure we respect both parent menu sorting order and then leaf-level menu sorting order.
                            orderIndex: (formMenu.orderIndex * 100000) + form.customProperties.menuOrderIndex
                        });
                    }

                    nestedSort(tree, (a, b) => {
                        return a.orderIndex - b.orderIndex;
                    });

                    this.menus = tree;
                }
            }
        });
    }
}
