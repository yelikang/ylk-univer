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

import type { IMutation } from '@univerjs/core';
import { CommandType, Tools } from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';

import type { IArrayFormulaRangeType, IArrayFormulaUnitCellType } from '../../basics/common';
import { FormulaDataModel } from '../../models/formula-data.model';

export interface ISetArrayFormulaDataMutationParams {
    arrayFormulaRange: IArrayFormulaRangeType;
    arrayFormulaCellData: IArrayFormulaUnitCellType;
}

export const SetArrayFormulaDataUndoMutationFactory = (accessor: IAccessor): ISetArrayFormulaDataMutationParams => {
    const formulaDataModel = accessor.get(FormulaDataModel);
    const arrayFormulaRange = Tools.deepClone(formulaDataModel.getArrayFormulaRange());
    const arrayFormulaCellData = Tools.deepClone(formulaDataModel.getArrayFormulaCellData());
    return {
        arrayFormulaRange,
        arrayFormulaCellData,
    };
};

export const SetArrayFormulaDataMutation: IMutation<ISetArrayFormulaDataMutationParams> = {
    id: 'formula.mutation.set-array-formula-data',
    type: CommandType.MUTATION,
    handler: (accessor: IAccessor, params: ISetArrayFormulaDataMutationParams) => {
        const formulaDataModel = accessor.get(FormulaDataModel);
        formulaDataModel.setArrayFormulaRange(params.arrayFormulaRange);
        formulaDataModel.setArrayFormulaCellData(params.arrayFormulaCellData);
        return true;
    },
};
