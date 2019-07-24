"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BuilderHelper;
(function (BuilderHelper) {
    function getObjectColumns(o) {
        let columns;
        o.properties.forEach((e) => {
            columns.push(e.column);
        });
        return columns;
    }
    BuilderHelper.getObjectColumns = getObjectColumns;
    function getType(o) {
        if (o.type.toLowerCase().includes('str'))
            return 'str';
        else if (o.type.toLowerCase().includes('int'))
            return 'int';
        else if (o.type.toLowerCase().includes('fl'))
            return 'float';
        else if (o.type.toLowerCase().includes('date'))
            return 'date';
        else if (o.type.toLowerCase().includes('json'))
            return 'json';
        else if (o.type.toLowerCase().includes('list'))
            return 'list';
        else
            return 'obj';
    }
    BuilderHelper.getType = getType;
})(BuilderHelper = exports.BuilderHelper || (exports.BuilderHelper = {}));
//# sourceMappingURL=builderhelper.js.map