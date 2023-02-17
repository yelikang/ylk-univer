import { SheetPlugin } from '@univerjs/base-sheets';
import { RangeList, Plugin, Tools, PLUGIN_NAMES, CommandManager, SheetActionBase, SetZoomRatioAction } from '@univerjs/core';
import { CountBar } from '../View/CountBar';

export class CountBarUIController {
    protected _countBar: CountBar;
    protected _plugin: Plugin;

    protected _totalRangeList(rangeList: RangeList): void {
        let rectList = rangeList.getRangeList();
        let recList: string[] = [];
        let plugin = this._plugin;
        let workbook = plugin.getUniver().getCurrentUniverSheetInstance().getWorkBook();
        let worksheet = workbook.getActiveSheet();
        let cellMatrix = worksheet.getCellMatrix();
        let avg = 0;
        let total = 0;
        let count = 0;
        for (let i = 0; i < rectList.length; i++) {
            let rect = rectList[i];
            for (let r = rect.startRow; r <= rect.endRow; r++) {
                for (let c = rect.startColumn; c <= rect.endColumn; c++) {
                    if (recList.includes(`${r}${c}`)) {
                        continue;
                    }
                    const cell = cellMatrix.getValue(r, c);
                    if (cell) {
                        let value = parseFloat(cell.v as string);
                        // eslint-disable-next-line no-restricted-globals
                        if (!isNaN(value)) {
                            count += 1;
                            total += value;
                        }
                    }
                    recList.push(`${r}${c}`);
                }
            }
        }
        if (count > 0) {
            avg = total / count;
        }
        this._countBar.setState({
            content: `平均数：${Tools.numberFixed(avg, 2)} 计数：${Tools.numberFixed(total, 2)} 数量：${count}`,
        });
    }

    protected _refreshCountBarUI(): void {

    }

    protected _refreshComponent(): void {
        this._refreshCountBarUI();
    }

    constructor(plugin: Plugin) {
        this._plugin = plugin;
        CommandManager.getActionObservers().add((event) => {
            const action = event.action as SheetActionBase<any>;
            const data = event.data;
            const workbook = action.getWorkBook();
            const unitId = workbook.getUnitId();
            const currentWorkbook = this._plugin.getUniver().getCurrentUniverSheetInstance().getWorkBook();
            const currentUnitId = currentWorkbook.getUnitId();
            if (unitId === currentUnitId) {
                switch (data.actionName) {
                    case SetZoomRatioAction.NAME: {
                        this._refreshCountBarUI();
                        break;
                    }
                }
            }
        });
        const manager = plugin
            .getUniver()
            .getCurrentUniverSheetInstance()
            .context
            .getPluginManager()
            .getRequirePluginByName<SheetPlugin>(PLUGIN_NAMES.SPREADSHEET)
            .getSelectionManager();
        plugin.getObserver('onChangeSelectionObserver')?.add(() => {
            const rangeList = manager.getActiveRangeList();
            if (rangeList && this._countBar) {
                this._totalRangeList(rangeList);
            }
        });
    }

    // changeRatio
    onChange = (v: string) => {
        console.log(v);
        this._plugin.getUniver().getCurrentUniverSheetInstance().getWorkBook().getActiveSheet().setZoomRatio(Tools.numberFixed(v / 100, 2));
    }

    // 刷新组件
    setCountBar(content: string) {
        this._countBar.setValue({
            content,
        });
    }

    // 获取CountBar组件
    getComponent = (ref: CountBar) => {
        this._countBar = ref;
        this._refreshComponent();
    };

}
