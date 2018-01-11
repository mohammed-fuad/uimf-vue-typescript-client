import {
	InputFieldEventHandler,
	InputController,
	FormInstance,
	FormEventArguments
} from 'core-framework';
import * as umf from 'uimf-core';

export class InputLogToConsole extends InputFieldEventHandler {
	run(input: InputController<any>, eventHandlerMetadata: umf.EventHandlerMetadata, args: FormEventArguments): Promise<any> {
		return input.serialize().then(t => {
			console.log(`[${eventHandlerMetadata.runAt}] input event handler '${eventHandlerMetadata.id}' from '${input.metadata.id}'`);
		});
	}
}