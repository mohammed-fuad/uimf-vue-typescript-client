import Vue from 'vue';
import { Component } from 'vue-property-decorator';

@Component({
	template: require('./FormInstance.html')
})
export class FormInstance extends Vue {
	field: any;

	created() {
		this.field = this.$attrs['field'];
	}
}