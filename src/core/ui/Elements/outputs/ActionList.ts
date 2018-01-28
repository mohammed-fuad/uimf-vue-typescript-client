import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { FormComponent } from 'core-form';
import { Modal } from './Modal';
import EventBus from 'core/event-bus';
import { ActionListEventArguments } from './ActionListEventArguments';

import './ActionList.scss';

@Component({
	template: require('./ActionList.html'),
	components: { 'modal': Modal, 'FormComponent': FormComponent }
})
export class ActionList extends Vue {
	open: boolean = false;
	current: any = null;
	modalid = 0;
	modals = [];
	field: any;
	app: any;
	form: any;
	parent: any;
	data: any;
	modalComponent: any = {};
	private initialized: boolean = false;

	get modalId() {
		return this.modalid;
	}
	created() {
		this.field = this.$attrs['field'];
		this.app = this.$attrs['app'];
		this.form = this.$attrs['form'];
		this.parent = this.$attrs['parent'];
		this.modalid += 1;
	}

	beforeDestroy() {
		EventBus.$off('form:responseHandled');
	}

	run = async function (action, app) {
		let self = this;
		let formInstance = app.getFormInstance(action.form, true);

		// TODO: find a way to initialize from action.inputFieldValues directly.
		let serializedInputValues = formInstance.getSerializedInputValuesFromObject(action.inputFieldValues);
		await formInstance.initializeInputFields(serializedInputValues);

		let allRequiredInputsHaveData = await formInstance.allRequiredInputsHaveData(false);

		if (action.action === 'run' && allRequiredInputsHaveData) {
			await formInstance.submit(this.app, false);
			this.onActionRun(formInstance.metadata.id);
		}
		else {
			this.open = true;

			this.modalComponent = {
				metadata: formInstance.metadata,
				form: formInstance,
				app: app,
				parent: self.parent,
				useUrl: false
			};

			this.initialized = true;

			EventBus.$on('form:responseHandled', e => {
				if (e.invokedByUser && formInstance.metadata.closeOnPostIfModal) {
					self.close(true);
				}
			});

			this.current = self;
			this.modals.push(self);
		}
	};

	close(reloadParentForm) {
		// Ensure the modal div is hidden.
		this.open = false;

		EventBus.$off('form:responseHandled');

		if (reloadParentForm) {
			let formId = this.form.metadata.id;
			this.onActionRun(formId);
		}

		this.modals.slice(this.modals.findIndex(a => a === this));
	}

	async onActionRun(formId) {
		let parentForm = this.parent;
		let app = parentForm.app;
		let formInstance = parentForm.form;

		await parentForm.submit(app, formInstance, null, true);

		let eventArgs = new ActionListEventArguments(app, formId);
		parentForm.fireAndBubbleUp(`action-list:run`, eventArgs);
	}
}