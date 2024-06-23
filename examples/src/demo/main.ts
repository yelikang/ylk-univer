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

import { LocaleType, LogLevel, Univer, UniverInstanceType } from '@univerjs/core';
import { defaultTheme } from '@univerjs/design';
import { UniverUIPlugin } from '@univerjs/ui';
import { UniverSheetsUIPlugin } from '@univerjs/sheets-ui';
import { UniverDocsPlugin } from '@univerjs/docs';
import { UniverDocsUIPlugin } from '@univerjs/docs-ui';
import { enUS, ruRU, zhCN } from '../locales';

const univer = new Univer({
    theme: defaultTheme,
    locale: LocaleType.ZH_CN,
    locales: {
        [LocaleType.ZH_CN]: zhCN,
        [LocaleType.EN_US]: enUS,
        [LocaleType.RU_RU]: ruRU,
    },
    logLevel: LogLevel.VERBOSE,
});
// ======= 核心插件

// 文本编辑
univer.registerPlugin(UniverDocsPlugin, {
    hasScroll: false,
});
univer.registerPlugin(UniverDocsUIPlugin);

// 渲染引擎
// univer.registerPlugin(UniverRenderEnginePlugin);

// UI插件
univer.registerPlugin(UniverUIPlugin, {
    container: 'app',
});

// univer.registerPlugin(UniverSheetsPlugin, {
//     notExecuteFormula: true,
// });
univer.registerPlugin(UniverSheetsUIPlugin);

// ========= sheet 特性插件

// 绘制插件
// univer.registerPlugin(UniverSheetsDrawingUIPlugin);

// 初始化
univer.createUnit(UniverInstanceType.UNIVER_SHEET, {});
