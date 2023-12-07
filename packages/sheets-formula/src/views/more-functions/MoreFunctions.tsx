import { LocaleService } from '@univerjs/core';
import { Button } from '@univerjs/design';
import type { IFunctionInfo } from '@univerjs/engine-formula';
import { ISidebarService } from '@univerjs/ui';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { useState } from 'react';

import { IFormulaInputService } from '../../services/formula-input.service';
import styles from './index.module.less';
import { InputParams } from './input-params/InputParams';
import { SelectFunction } from './select-function/SelectFunction';

export function MoreFunctions() {
    const [selectFunction, setSelectFunction] = useState<boolean>(true);
    const [inputParams, setInputParams] = useState<boolean>(false);
    const [params, setParams] = useState<string[]>([]);
    const [functionInfo, setFunctionInfo] = useState<IFunctionInfo | null>(null);

    const localeService = useDependency(LocaleService);
    const sidebarService = useDependency(ISidebarService);
    const formulaInputService = useDependency(IFormulaInputService);

    function handleClickNextPrev() {
        if (selectFunction) {
            // TODO@Dushusir: insert function
        }

        setSelectFunction(!selectFunction);
        setInputParams(!inputParams);
    }

    function handleConfirm() {
        // TODO@Dushusir: save function  `=${functionInfo?.functionName}(${params.join(',')})`
        formulaInputService.inputFormula(`=${functionInfo?.functionName}(`);
    }

    return (
        <div className={styles.formulaMoreFunctions}>
            {selectFunction && <SelectFunction onChange={setFunctionInfo} />}
            {inputParams && <InputParams functionInfo={functionInfo} onChange={setParams} />}
            <div className={styles.formulaMoreFunctionsOperation}>
                {/* TODO@Dushusir: open input params after range selector refactor */}
                {inputParams && (
                    <Button type="primary" onClick={handleClickNextPrev}>
                        {localeService.t('formula.moreFunctions.next')}
                    </Button>
                )}
                {inputParams && (
                    <Button onClick={handleClickNextPrev}>{localeService.t('formula.moreFunctions.prev')}</Button>
                )}
                {selectFunction && (
                    <Button type="primary" onClick={handleConfirm}>
                        {localeService.t('formula.moreFunctions.confirm')}
                    </Button>
                )}
            </div>
        </div>
    );
}