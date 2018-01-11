import {
	FormInstance,
	FormEventHandler,
	FormEventArguments
} from 'core-framework';
import { EventHandlerMetadata } from 'uimf-core';
import { ActionListEventArguments } from 'core-ui/elements/outputs/ActionListEventArguments';

/**
 * Reloads form after 
 */
export class ReloadFormAfterAction extends FormEventHandler {
	run(form: FormInstance, eventHandlerMetadata: EventHandlerMetadata, args: ActionListEventArguments): Promise<void> {
		let isTopLevelForm = args.form.get('parent') == null;
		
		if (isTopLevelForm && eventHandlerMetadata.customProperties.formId === args.actionFormId) {
			args.form.submit(args.app, form, null, false);
		}

		return Promise.resolve();
	}
}
