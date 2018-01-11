import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { Input } from 'core/ui/input';

@Component({
	template: require('./DynamicForm.html'),
	components: {
		'FormInput': Input
	}
})
export class DynamicForm extends Vue {
	form: any;
	app: any;
	field: any;
	tabindex: number;
	private inputid: number = 0;
	inputs: any[] = [];

	get inputId() {
		return this.inputid += 1;
	}

	get id() {
		return `dfi${this.inputId}`;
	}

	created() {
		this.app = this.$attrs['app'];
		this.field = this.$attrs['field'];

		if (this.field.value == null) {
			return;
		}

		this.form = this.$attrs['form'];
		this.tabindex = parseInt(this.$attrs['tabindex']).valueOf();

		let self = this;
		this.initialiseInputs(this.field, this.app).then(() => {
			self.inputs = this.field.inputs;
		});
	}

	initialiseInputs = async function (field, app) {
		field.inputs = app.controlRegister.createInputControllers(field.value.inputs);

		let promises = [];
		for (let input of field.inputs) {
			let i = field.value.inputs.find(t => t.inputId === input.metadata.inputId);
			if (i != null) {
				let p = input.init(i.value);
				promises.push(p);
			}
		}

		await Promise.all(promises);
	};
}