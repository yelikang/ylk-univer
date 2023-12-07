import type { ICellData, IRange, IStyleData, Nullable, Univer } from '@univerjs/core';
import { ICommandService, IUniverInstanceService, RANGE_TYPE, Rectangle } from '@univerjs/core';
import {
    AddWorksheetMergeMutation,
    NORMAL_SELECTION_PLUGIN_NAME,
    RemoveWorksheetMergeMutation,
    SelectionManagerService,
    SetRangeValuesMutation,
    SetSelectionsOperation,
    SetWorksheetColWidthMutation,
    SetWorksheetRowHeightMutation,
} from '@univerjs/sheets';
import type { Injector } from '@wendellhu/redi';
import { afterEach, beforeEach, describe, it, vi } from 'vitest';

import { ISheetClipboardService } from '../clipboard.service';
import { clipboardTestBed } from './clipboard-test-bed';
import type { IClipboardItem } from './mock-clipboard';
import { MockClipboard } from './mock-clipboard';

describe('Test clipboard', () => {
    let univer: Univer;
    let get: Injector['get'];
    let commandService: ICommandService;
    let sheetClipboardService: ISheetClipboardService;
    let clipboardItem: IClipboardItem;
    let getValues: (
        startRow: number,
        startColumn: number,
        endRow: number,
        endColumn: number
    ) => Array<Array<Nullable<ICellData>>> | undefined;
    let getMergedCells: (
        startRow: number,
        startColumn: number,
        endRow: number,
        endColumn: number
    ) => IRange[] | undefined;

    let getStyles: (
        startRow: number,
        startColumn: number,
        endRow: number,
        endColumn: number
    ) => Array<Array<Nullable<IStyleData>>> | undefined;

    beforeEach(async () => {
        const testBed = clipboardTestBed();
        univer = testBed.univer;
        get = testBed.get;

        commandService = get(ICommandService);
        commandService.registerCommand(SetRangeValuesMutation);
        commandService.registerCommand(SetWorksheetRowHeightMutation);
        commandService.registerCommand(SetWorksheetColWidthMutation);
        commandService.registerCommand(AddWorksheetMergeMutation);
        commandService.registerCommand(RemoveWorksheetMergeMutation);
        commandService.registerCommand(SetSelectionsOperation);

        sheetClipboardService = get(ISheetClipboardService);

        getValues = (
            startRow: number,
            startColumn: number,
            endRow: number,
            endColumn: number
        ): Array<Array<Nullable<ICellData>>> | undefined =>
            get(IUniverInstanceService)
                .getUniverSheetInstance('test')
                ?.getSheetBySheetId('sheet1')
                ?.getRange(startRow, startColumn, endRow, endColumn)
                .getValues();

        getMergedCells = (
            startRow: number,
            startColumn: number,
            endRow: number,
            endColumn: number
        ): IRange[] | undefined =>
            get(IUniverInstanceService)
                .getUniverSheetInstance('test')
                ?.getSheetBySheetId('sheet1')
                ?.getMergeData()
                .filter((rect) => Rectangle.intersects({ startRow, startColumn, endRow, endColumn }, rect));

        getStyles = (
            startRow: number,
            startColumn: number,
            endRow: number,
            endColumn: number
        ): Array<Array<Nullable<IStyleData>>> | undefined => {
            const values = getValues(startRow, startColumn, endRow, endColumn);
            const styles = get(IUniverInstanceService).getUniverSheetInstance('test')?.getStyles();
            if (values && styles) {
                return values.map((row) => row.map((cell) => styles.getStyleByCell(cell)));
            }
        };
        // read use mock
        const clipboardData = {
            'text/html': `<google-sheets-html-origin>
                <table xmlns="http://www.w3.org/1999/xhtml" cellspacing="0" cellpadding="0" dir="ltr" border="1"
                    style="table-layout:fixed;font-size:10pt;font-family:Arial;width:0px;border-collapse:collapse;border:none">
                    <colgroup>
                        <col width="73">
                        <col width="73">
                    </colgroup>\n<tbody>
                        <tr style="height: 81px;">
                            <td rowspan="1" colspan="2"
                                style="background: rgb(255,0,0); text-align: center; vertical-align: middle;">row1col2</td>
                        </tr>
                    </tbody>
                </table>
            </google-sheets-html-origin>`,
        };
        const mockClipboard = new MockClipboard(clipboardData);
        const clipboardItems = await mockClipboard.read();

        if (clipboardItems.length !== 0) {
            clipboardItem = clipboardItems[0];
        }
    });

    afterEach(() => {
        univer?.dispose();
    });

    describe('Test paste, the original data is a merged cell of 1 row and 2 columns, the current selection consists only of ordinary cells', () => {
        it('The current selection is a single cell in 1 row and 1 column', async () => {
            const selectionManager = get(SelectionManagerService);

            selectionManager.setCurrentSelection({
                pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                unitId: 'test',
                sheetId: 'sheet1',
            });

            // set selection to A1
            const startRow = 0;
            const startColumn = 0;
            const endRow = 0;
            const endColumn = 0;

            selectionManager.add([
                {
                    range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            await sheetClipboardService.paste(clipboardItem);
            const values = getValues(startRow, startColumn, endRow, endColumn);
            const styles = getStyles(startRow, startColumn, endRow, endColumn);
            const mergedCells = getMergedCells(startRow, startColumn, endRow, endColumn);
            // expect(values && values[0][0]?.v).toBe('row1col2');
            // expect(styles && styles[0][0]).toStrictEqual({
            //     bg: { rgb: 'rgb(255,0,0)' },
            //     ht: 2,
            //     vt: 2,
            // });
            // expect(mergedCells && mergedCells[0]).toStrictEqual({
            //     startRow: 0,
            //     startColumn: 0,
            //     endRow: 0,
            //     endColumn: 1,
            // });
        });
        it('The current selection is a single cell in 1 row and 2 columns', async () => {
            const selectionManager = get(SelectionManagerService);

            selectionManager.setCurrentSelection({
                pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                unitId: 'test',
                sheetId: 'sheet1',
            });

            // set selection to A2:B2
            const startRow = 1;
            const startColumn = 0;
            const endRow = 1;
            const endColumn = 1;

            selectionManager.add([
                {
                    range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            await sheetClipboardService.paste(clipboardItem);
            const values = getValues(startRow, startColumn, endRow, endColumn);
            const styles = getStyles(startRow, startColumn, endRow, endColumn);
            const mergedCells = getMergedCells(startRow, startColumn, endRow, endColumn);
            // expect(values && values[0][0]?.v).toBe('row1col2');
            // expect(styles && styles[0][0]).toStrictEqual({
            //     bg: { rgb: 'rgb(255,0,0)' },
            //     ht: 2,
            //     vt: 2,
            // });
            // expect(mergedCells && mergedCells[0]).toStrictEqual({
            //     startRow,
            //     startColumn,
            //     endRow,
            //     endColumn,
            // });
        });
        it('The current selection is a single cell in 1 row and 3 columns', async () => {
            const selectionManager = get(SelectionManagerService);

            selectionManager.setCurrentSelection({
                pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                unitId: 'test',
                sheetId: 'sheet1',
            });

            // set selection to A3:C3
            const startRow = 2;
            const startColumn = 0;
            const endRow = 2;
            const endColumn = 2;

            selectionManager.add([
                {
                    range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            await sheetClipboardService.paste(clipboardItem);
            const values = getValues(startRow, startColumn, endRow, endColumn);
            const styles = getStyles(startRow, startColumn, endRow, endColumn);
            const mergedCells = getMergedCells(startRow, startColumn, endRow, endColumn);
            // expect(values && values[0][0]?.v).toBe('row1col2');
            // expect(styles && styles[0][0]).toStrictEqual({
            //     bg: { rgb: 'rgb(255,0,0)' },
            //     ht: 2,
            //     vt: 2,
            // });
            // expect(mergedCells && mergedCells[0]).toStrictEqual({
            //     startRow: 2,
            //     startColumn: 0,
            //     endRow: 2,
            //     endColumn: 1,
            // });
        });
        it('The current selection is a single cell in 2 rows and 2 columns', async () => {
            const selectionManager = get(SelectionManagerService);

            selectionManager.setCurrentSelection({
                pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                unitId: 'test',
                sheetId: 'sheet1',
            });

            // set selection to A4:B5
            const startRow = 3;
            const startColumn = 0;
            const endRow = 4;
            const endColumn = 1;

            selectionManager.add([
                {
                    range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            await sheetClipboardService.paste(clipboardItem);
            const values = getValues(startRow, startColumn, endRow, endColumn);
            const styles = getStyles(startRow, startColumn, endRow, endColumn);
            const mergedCells = getMergedCells(startRow, startColumn, endRow, endColumn);
            // expect(values && values[0][0]?.v).toBe('row1col2');
            // expect(values && values[1][0]?.v).toBe('row1col2');

            // expect(styles && styles[0][0]).toStrictEqual({
            //     bg: { rgb: 'rgb(255,0,0)' },
            //     ht: 2,
            //     vt: 2,
            // });
            // expect(styles && styles[1][0]).toStrictEqual({
            //     bg: { rgb: 'rgb(255,0,0)' },
            //     ht: 2,
            //     vt: 2,
            // });
            // expect(mergedCells).toStrictEqual([
            //     {
            //         startRow: 3,
            //         startColumn: 0,
            //         endRow: 3,
            //         endColumn: 1,
            //     },
            //     {
            //         startRow: 4,
            //         startColumn: 0,
            //         endRow: 4,
            //         endColumn: 1,
            //     },
            // ]);
        });
        it('The current selection is a single cell in 4 rows and 4 columns', async () => {
            const selectionManager = get(SelectionManagerService);

            selectionManager.setCurrentSelection({
                pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                unitId: 'test',
                sheetId: 'sheet1',
            });

            // set selection to A6:D9
            const startRow = 5;
            const startColumn = 0;
            const endRow = 8;
            const endColumn = 3;

            selectionManager.add([
                {
                    range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            await sheetClipboardService.paste(clipboardItem);
            const values = getValues(startRow, startColumn, endRow, endColumn);
            const styles = getStyles(startRow, startColumn, endRow, endColumn);
            const mergedCells = getMergedCells(startRow, startColumn, endRow, endColumn);

            for (let i = 0; i < 4; i++) {
                // expect(values && values[i][0]?.v).toBe('row1col2');
                // expect(values && values[i][2]?.v).toBe('row1col2');
                // expect(styles && styles[i][0]).toStrictEqual({
                //     bg: { rgb: 'rgb(255,0,0)' },
                //     ht: 2,
                //     vt: 2,
                // });
                // expect(styles && styles[i][2]).toStrictEqual({
                //     bg: { rgb: 'rgb(255,0,0)' },
                //     ht: 2,
                //     vt: 2,
                // });
            }
            // expect(mergedCells).toStrictEqual([
            //     {
            //         startRow: 5,
            //         startColumn: 0,
            //         endRow: 5,
            //         endColumn: 1,
            //     },
            //     {
            //         startRow: 5,
            //         startColumn: 2,
            //         endRow: 5,
            //         endColumn: 3,
            //     },
            //     {
            //         startRow: 6,
            //         startColumn: 0,
            //         endRow: 6,
            //         endColumn: 1,
            //     },
            //     {
            //         startRow: 6,
            //         startColumn: 2,
            //         endRow: 6,
            //         endColumn: 3,
            //     },
            //     {
            //         startRow: 7,
            //         startColumn: 0,
            //         endRow: 7,
            //         endColumn: 1,
            //     },
            //     {
            //         startRow: 7,
            //         startColumn: 2,
            //         endRow: 7,
            //         endColumn: 3,
            //     },
            //     {
            //         startRow: 8,
            //         startColumn: 0,
            //         endRow: 8,
            //         endColumn: 1,
            //     },
            //     {
            //         startRow: 8,
            //         startColumn: 2,
            //         endRow: 8,
            //         endColumn: 3,
            //     },
            // ]);
        });
    });

    describe('Test paste, the original data is a merged cell of 1 row and 2 columns, the current selection contains merged cells and no content', () => {
        it('The current selection is a merged cell of 1 row and 2 columns.', async () => {
            const selectionManager = get(SelectionManagerService);

            selectionManager.setCurrentSelection({
                pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                unitId: 'test',
                sheetId: 'sheet1',
            });

            // set selection to F1:G2
            const startRow = 0;
            const startColumn = 5;
            const endRow = 0;
            const endColumn = 6;

            selectionManager.add([
                {
                    range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            await sheetClipboardService.paste(clipboardItem);
            const values = getValues(startRow, startColumn, endRow, endColumn);
            const styles = getStyles(startRow, startColumn, endRow, endColumn);
            const mergedCells = getMergedCells(startRow, startColumn, endRow, endColumn);

            // expect(values && values[0][0]?.v).toBe('row1col2');
            // expect(styles && styles[0][0]).toStrictEqual({
            //     bg: { rgb: 'rgb(255,0,0)' },
            //     ht: 2,
            //     vt: 2,
            // });
            // expect(mergedCells && mergedCells[0]).toStrictEqual({
            //     startRow,
            //     startColumn,
            //     endRow,
            //     endColumn,
            // });
        });

        it('The current selection is a merged cell of 1 row and 3 columns.', async () => {
            const selectionManager = get(SelectionManagerService);

            selectionManager.setCurrentSelection({
                pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                unitId: 'test',
                sheetId: 'sheet1',
            });

            // set selection to F3:H3
            const startRow = 2;
            const startColumn = 5;
            const endRow = 2;
            const endColumn = 7;

            selectionManager.add([
                {
                    range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            await sheetClipboardService.paste(clipboardItem);
            const values = getValues(startRow, startColumn, endRow, endColumn);
            const styles = getStyles(startRow, startColumn, endRow, endColumn);
            const mergedCells = getMergedCells(startRow, startColumn, endRow, endColumn);

            // expect(values && values[0][0]?.v).toBe('row1col2');
            // expect(styles && styles[0][0]).toBe(undefined);
            // expect(mergedCells && mergedCells[0]).toStrictEqual({
            //     startRow,
            //     startColumn,
            //     endRow,
            //     endColumn,
            // });
        });

        it('The current selection is a merged cell of 1 row and 4 columns.', async () => {
            const selectionManager = get(SelectionManagerService);

            selectionManager.setCurrentSelection({
                pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                unitId: 'test',
                sheetId: 'sheet1',
            });

            // set selection to F5:I5
            const startRow = 4;
            const startColumn = 5;
            const endRow = 4;
            const endColumn = 8;

            selectionManager.add([
                {
                    range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            await sheetClipboardService.paste(clipboardItem);
            const values = getValues(startRow, startColumn, endRow, endColumn);
            const styles = getStyles(startRow, startColumn, endRow, endColumn);
            const mergedCells = getMergedCells(startRow, startColumn, endRow, endColumn);

            // expect(values && values[0][0]?.v).toBe('row1col2');
            // expect(styles && styles[0][0]).toBe(undefined);
            // expect(mergedCells && mergedCells[0]).toStrictEqual({
            //     startRow,
            //     startColumn,
            //     endRow,
            //     endColumn,
            // });
        });

        it('The current selection is a merged cell of 2 rows and 2 columns.', async () => {
            const selectionManager = get(SelectionManagerService);

            selectionManager.setCurrentSelection({
                pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                unitId: 'test',
                sheetId: 'sheet1',
            });

            // set selection to F7:G8
            const startRow = 6;
            const startColumn = 5;
            const endRow = 7;
            const endColumn = 6;

            selectionManager.add([
                {
                    range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            await sheetClipboardService.paste(clipboardItem);
            const values = getValues(startRow, startColumn, endRow, endColumn);
            const styles = getStyles(startRow, startColumn, endRow, endColumn);
            const mergedCells = getMergedCells(startRow, startColumn, endRow, endColumn);

            // expect(values && values[0][0]?.v).toBe('row1col2');
            // expect(styles && styles[0][0]).toBe(undefined);
            // expect(mergedCells && mergedCells[0]).toStrictEqual({
            //     startRow,
            //     startColumn,
            //     endRow,
            //     endColumn,
            // });
        });

        it('The current selection is a merged cell of 1 row and 2 columns, with 1 ordinary cell', async () => {
            const selectionManager = get(SelectionManagerService);

            selectionManager.setCurrentSelection({
                pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                unitId: 'test',
                sheetId: 'sheet1',
            });

            // set selection to F10:H10
            const startRow = 9;
            const startColumn = 5;
            const endRow = 9;
            const endColumn = 7;

            selectionManager.add([
                {
                    range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            await sheetClipboardService.paste(clipboardItem);
            const values = getValues(startRow, startColumn, endRow, endColumn);
            const styles = getStyles(startRow, startColumn, endRow, endColumn);
            const mergedCells = getMergedCells(startRow, startColumn, endRow, endColumn);

            // expect(values && values[0][0]?.v).toBe('row1col2');
            // expect(styles && styles[0][0]).toStrictEqual({ bg: { rgb: 'rgb(255,0,0)' }, ht: 2, vt: 2 });
            // expect(mergedCells && mergedCells[0]).toStrictEqual({
            //     startRow: 9,
            //     startColumn: 5,
            //     endRow: 9,
            //     endColumn: 6,
            // });
        });

        it('The current selection is a merged cell of 2 rows and 2 columns, with a merged cell of 2 rows and 1 column', async () => {
            const selectionManager = get(SelectionManagerService);

            selectionManager.setCurrentSelection({
                pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                unitId: 'test',
                sheetId: 'sheet1',
            });

            // set selection to F12:H13
            const startRow = 11;
            const startColumn = 5;
            const endRow = 12;
            const endColumn = 7;

            selectionManager.add([
                {
                    range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            // TODO@Dushusir remove after Dialog replacement
            let alert = false;
            vi.spyOn(window, 'alert').mockImplementation(() => {
                alert = true;
            });

            await sheetClipboardService.paste(clipboardItem);
            // expect(alert).toBe(true);

            const values = getValues(startRow, startColumn, endRow, endColumn);
            const styles = getStyles(startRow, startColumn, endRow, endColumn);
            const mergedCells = getMergedCells(startRow, startColumn, endRow, endColumn);

            // expect(values && values[0][0]?.v).toBe(undefined);
            // expect(styles && styles[0][0]).toBe(undefined);
            // expect(mergedCells).toStrictEqual([
            //     {
            //         startRow: 11,
            //         startColumn: 5,
            //         endRow: 12,
            //         endColumn: 6,
            //     },
            //     {
            //         startRow: 11,
            //         startColumn: 7,
            //         endRow: 12,
            //         endColumn: 7,
            //     },
            // ]);
        });
    });

    describe('Test paste, the original data is a merged cell of 1 row and 2 columns, the current selection contains merged cells with content and style', () => {
        it('The current selection is a merged cell of 1 row and 3 columns', async () => {
            const selectionManager = get(SelectionManagerService);

            selectionManager.setCurrentSelection({
                pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                unitId: 'test',
                sheetId: 'sheet1',
            });

            // set selection to K4:M4
            const startRow = 3;
            const startColumn = 10;
            const endRow = 3;
            const endColumn = 12;

            selectionManager.add([
                {
                    range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            await sheetClipboardService.paste(clipboardItem);

            const values = getValues(startRow, startColumn, endRow, endColumn);
            const styles = getStyles(startRow, startColumn, endRow, endColumn);
            const mergedCells = getMergedCells(startRow, startColumn, endRow, endColumn);

            // expect(values && values[0][0]?.v).toBe('row1col2');
            // expect(styles && styles[0][0]).toStrictEqual({
            //     bg: {
            //         rgb: '#ccc',
            //     },
            // });
            // expect(mergedCells && mergedCells[0]).toStrictEqual({
            //     startRow,
            //     startColumn,
            //     endRow,
            //     endColumn,
            // });
        });
        it('The current selection is a merged cell of 1 row and 2 columns, with a merged cell of 2 rows and 2 columns', async () => {
            const selectionManager = get(SelectionManagerService);

            selectionManager.setCurrentSelection({
                pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                unitId: 'test',
                sheetId: 'sheet1',
            });

            // set selection to K7:M10
            const startRow = 6;
            const startColumn = 10;
            const endRow = 9;
            const endColumn = 12;

            selectionManager.add([
                {
                    range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            await sheetClipboardService.paste(clipboardItem);

            const values = getValues(startRow, startColumn, endRow, endColumn);
            const styles = getStyles(startRow, startColumn, endRow, endColumn);
            const mergedCells = getMergedCells(startRow, startColumn, endRow, endColumn);

            // first merged cells changed
            // expect(values && values[0][0]?.v).toBe('row1col2');
            // expect(styles && styles[0][0]).toStrictEqual({ bg: { rgb: 'rgb(255,0,0)' }, ht: 2, vt: 2 });

            // second merged cells not changed
            // expect(values && values[2][1]?.v).toBe('456');
            // expect(styles && styles[2][1]).toStrictEqual({ bg: { rgb: '#ccc' }, ht: 2, vt: 2 });

            // expect(mergedCells).toStrictEqual([
            //     {
            //         startRow: 8,
            //         startColumn: 11,
            //         endRow: 9,
            //         endColumn: 12,
            //     },
            //     {
            //         startRow: 6,
            //         startColumn: 10,
            //         endRow: 6,
            //         endColumn: 11,
            //     },
            // ]);
        });
        it('The current selection is a merged cell of 1 row and 3 columns, with a merged cell of 2 rows and 2 columns', async () => {
            const selectionManager = get(SelectionManagerService);

            selectionManager.setCurrentSelection({
                pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                unitId: 'test',
                sheetId: 'sheet1',
            });

            // set selection to K12:M15
            const startRow = 11;
            const startColumn = 10;
            const endRow = 14;
            const endColumn = 12;

            selectionManager.add([
                {
                    range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            let alert = false;
            vi.spyOn(window, 'alert').mockImplementation(() => {
                alert = true;
            });

            await sheetClipboardService.paste(clipboardItem);
            // expect(alert).toBe(true);

            const values = getValues(startRow, startColumn, endRow, endColumn);
            const styles = getStyles(startRow, startColumn, endRow, endColumn);
            const mergedCells = getMergedCells(startRow, startColumn, endRow, endColumn);

            // first merged cells not changed
            // expect(values && values[0][0]?.v).toBe('456');
            // expect(styles && styles[0][0]).toStrictEqual({ bg: { rgb: '#ccc' }, ht: 3 });

            // second merged cells not changed
            // expect(values && values[2][1]?.v).toBe('456');
            // expect(styles && styles[2][1]).toStrictEqual({ bg: { rgb: '#ccc' } });

            // expect(mergedCells).toStrictEqual([
            //     {
            //         startRow: 11,
            //         startColumn: 10,
            //         endRow: 11,
            //         endColumn: 12,
            //     },
            //     {
            //         startRow: 13,
            //         startColumn: 11,
            //         endRow: 14,
            //         endColumn: 12,
            //     },
            // ]);
        });
        it('The current selection is a merged cell of 2 rows and 2 columns, with a merged cell of 1 row and 2 columns', async () => {
            const selectionManager = get(SelectionManagerService);

            selectionManager.setCurrentSelection({
                pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                unitId: 'test',
                sheetId: 'sheet1',
            });

            // set selection to K22:M24
            const startRow = 21;
            const startColumn = 10;
            const endRow = 23;
            const endColumn = 12;

            selectionManager.add([
                {
                    range: { startRow, startColumn, endRow, endColumn, rangeType: RANGE_TYPE.NORMAL },
                    primary: null,
                    style: null,
                },
            ]);

            let alert = false;
            vi.spyOn(window, 'alert').mockImplementation(() => {
                alert = true;
            });

            await sheetClipboardService.paste(clipboardItem);
            // expect(alert).toBe(true);

            // const values = getValues(startRow, startColumn, endRow, endColumn);
            // const styles = getStyles(startRow, startColumn, endRow, endColumn);
            // const mergedCells = getMergedCells(startRow, startColumn, endRow, endColumn);

            // first merged cells not changed
            // expect(values && values[0][0]?.v).toBe('456');
            // expect(styles && styles[0][0]).toStrictEqual({ bg: { rgb: '#ccc' } });

            // second merged cells not changed
            // expect(values && values[2][1]?.v).toBe('456');
            // expect(styles && styles[2][1]).toStrictEqual({ bg: { rgb: '#ccc' } });

            // expect(mergedCells).toStrictEqual([
            //     {
            //         startRow: 21,
            //         startColumn: 10,
            //         endRow: 22,
            //         endColumn: 11,
            //     },
            //     {
            //         startRow: 23,
            //         startColumn: 11,
            //         endRow: 23,
            //         endColumn: 12,
            //     },
            // ]);
        });
    });
});