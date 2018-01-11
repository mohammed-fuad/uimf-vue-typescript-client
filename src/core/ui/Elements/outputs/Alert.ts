import Vue from 'vue';
import { Component } from 'vue-property-decorator';

import './Alert.scss';

@Component({
	template: require('./Alert.html')
})
export class Alert extends Vue {
	field: any;

	created() {
		this.field = this.$attrs['field'];
	}
}