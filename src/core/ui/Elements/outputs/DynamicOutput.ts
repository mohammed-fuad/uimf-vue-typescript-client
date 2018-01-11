import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as umf from 'core-framework';
import { Output } from 'core/ui/output';

import './DynamicOutput.scss';

@Component({
	template: require('./DynamicOutput.html'),
	components: {
		'FormOutput': Output
	}
})
export class DynamicOutput extends Vue {
	form: any;
	app: any;
	field: any;
	parent: any;
	items: any[] = [];

	created() {
		this.app = this.$attrs['app'];
		this.field = this.$attrs['field'];
		this.form = this.$attrs['form'];
		this.parent = this.$attrs['parent'];

		let metadata = this.field.metadata;
		let items = [];

		for (let item of this.field.data.items) {
			items.push(umf.FormInstance.getOutputFieldValues(metadata, item));
		}

		this.items = items;
	}
}