import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { Output } from 'core/ui/output';
import { Input } from 'core/ui/input';
import EventBus from 'core/event-bus';

import './form.scss';

function bindEventHandlersToCustomEvents(formComponent, eventHandlers) {
    let formInstance = formComponent.form;
    let app = formComponent.app;
    
    // Bind all 'form event handlers'. 
    for (let eventHandler of eventHandlers) {
        // Don't bind default event handlers, because they are already auto-bound inside FormInstance.
        if (eventHandler.runAt.indexOf('form:') === 0) {
            continue;
        }

        formComponent.$on(eventHandler.runAt, e => {
            // Augment event args with form which is firing the event. This is needed,
            // so that event handler can know from which particular form this event is coming.
            e.form = formComponent;

            formInstance.handleEvent(eventHandler.runAt, eventHandler, e);
        });
    }
}

@Component({
    template: require('./form.html'),
    components: {
        'FormOutput': Output,
        'FormInput': Input
    }
})
export class FormComponent extends Vue {
    initialized: boolean = false;
    visibleInputFields: any[] = [];
    submitButtonLabel: string = null;
    tabindex: number = 1;
    disabled: false;
    responseMetadata: any = {};
    urlData: null;
    useUrl: boolean = true;
    metadata: any = null;
    form: any;
    app: any;
    outputFieldValues: any = null;
    self: any;
    openForms: any[] = [];
    parent: any = null;

    setMetadata = function () {
        this.parent = this.$attrs['parent'];
        this.metadata = this.metadata || this.$attrs['metadata'];
        this.tabindex += parseInt(this.$attrs['tabindex']).valueOf() || 1;

        let url = new Boolean(this.$attrs['useUrl']).valueOf();

        if (this.$attrs['useUrl'] != null && !url) {
            this.useUrl = url;
        }

        let initialized = new Boolean(this.$attrs['initialized']).valueOf();

        if (this.$attrs['initialized'] != null && initialized) {
            this.initialized = initialized;
        }

        this.init();
    };

    created() {
        this.setMetadata();
    }

    beforeDestroy() {
        this.openForms = this.openForms.filter(f => f !== this);
    }

    init = async function () {
        if (!this.initialized) {
            this.form = this.form || this.$attrs['form'];
            this.self = this;
            this.initialized = true;

            this.visibleInputFields = this.form.inputs.filter(t => t.metadata.hidden === false);
            this.submitButtonLabel = this.form.metadata.customProperties != null && this.form.metadata.customProperties.submitButtonLabel
                ? this.form.metadata.customProperties.submitButtonLabel
                : 'Submit';

            this.tabindex += 1;

            this.app = this.app || this.$attrs['app'];
            
            bindEventHandlersToCustomEvents(this, this.form.metadata.eventHandlers);

            this.form.fire('form:loaded', { app: this.app });

            // Auto-submit form if necessary.
            if (this.form.metadata.postOnLoad) {
                await this.submit(this.app, this.form);
            }

            this.openForms.push(this);

            if (this.parent == null) {
                if (this.responseMetadata.title == null) {
                    document.title = this.form.metadata.label;
                }
            }
        }
    };

    fireAndBubbleUp(eventName, eventArgs) {
        EventBus.$emit(eventName, eventArgs);
        let parentFormComponent = this.parent;

        if (parentFormComponent != null) {
            parentFormComponent.fireAndBubbleUp(eventName, eventArgs);
        }
    }

    enableForm = function () {
        let formInstance = this.form;

        this.visibleInputFields = formInstance.inputs.filter(t => t.metadata.hidden === false);
        this.disabled = false;
    };

    renderResponse = function (response: any) {
        let formInstance = this.form;

        this.outputFieldValues = formInstance.outputs;
        this.responseMetadata = response.metadata;

        if (this.parent == null) {
            document.title = response.metadata.title;
        }
    };

    submit = async function (app, formInstance, event, redirect) {
        // Force Vue to re-render outputs.
        this.outputFieldValues = null;

        let self = this;

        if (event != null) {
            event.preventDefault();
        }

        // If not all required inputs are filled.
        let allRequiredInputsHaveValues = await formInstance.allRequiredInputsHaveData(redirect == null);
        if (!allRequiredInputsHaveValues) {
            return;
        }

        // Disable double-posts.
        self.disabled = true;

        // If postOnLoad == true, then the input field values should appear in the url.
        // Reason is that postOnLoad == true is used by 'report' pages, which need
        // their filters to be saved in the url. This does not apply to forms
        // with postOnLoad == false, because those forms are usually for creating new data
        // and hence should not be tracked in browser's history based on parameters.
        if (formInstance.metadata.postOnLoad && redirect && self.useUrl) {
            let urlParams = await formInstance.getSerializedInputValues();

            // Update url in the browser.
            app.go(formInstance.metadata.id, urlParams);

            return;
        }

        try {
            await formInstance.submit(app, redirect == null, { formComponent: self });

            self.enableForm();

            // Signal event to child controls.
            EventBus.$emit('form:responseHandled', {
                form: self,
                invokedByUser: event != null
            });
        }
        catch (e) {
            self.enableForm();
        }
    };

    reloadTopForm() {
        let parentFormComponent = this.parent;

        if (parentFormComponent != null) {
            parentFormComponent.reloadTopForm();
        }
        else {
            let app = this.app;
            let formInstance = this.form;
            this.submit(app, formInstance, null, true);
        }
    }

    reloadAllForms() {
        for (let f of this.openForms) {
            f.reloadTopForm();
        }
    }
}
