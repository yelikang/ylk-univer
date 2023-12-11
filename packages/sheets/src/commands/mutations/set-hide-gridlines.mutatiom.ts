/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { BooleanNumber, IMutation } from '@univerjs/core';
import { CommandType, IUniverInstanceService, Tools } from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';

export interface ISetHideGridlinesMutationParams {
    hideGridlines: BooleanNumber;
    workbookId: string;
    worksheetId: string;
}

export const SetHideGridlinesUndoMutationFactory = (
    accessor: IAccessor,
    params: ISetHideGridlinesMutationParams
): ISetHideGridlinesMutationParams => {
    const workbook = accessor.get(IUniverInstanceService).getUniverSheetInstance(params.workbookId);
    const worksheet = workbook!.getSheetBySheetId(params.worksheetId);
    const config = worksheet!.getConfig();

    const oldStatus = config.showGridlines;

    return {
        ...Tools.deepClone(params),
        hideGridlines: oldStatus,
    };
};

export const SetHideGridlinesMutation: IMutation<ISetHideGridlinesMutationParams> = {
    id: 'sheet.mutation.set-hide-gridlines',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const workbook = accessor.get(IUniverInstanceService).getUniverSheetInstance(params.workbookId);
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(params.worksheetId);
        if (!worksheet) return false;
        const config = worksheet.getConfig();

        config.showGridlines = params.hideGridlines;

        return true;
    },
};
