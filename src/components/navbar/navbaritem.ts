import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';
import { Link } from './link';
import { Logger } from '../../util/log';

@Component({
	template: require('./navbaritem.html')
})
export class Navbaritem extends Vue {
	menu: any;
	nav: any;

	created() {
		this.menu = this.$attrs['menu'];
		this.nav = this.constructor || {};
	}
}