"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const connection_1 = __importDefault(require("./connection"));
var BuilderHelper;
(function (BuilderHelper) {
    function buildQueryResolver(o) {
        let resolver = o.resolver;
        let where = resolver.where.length > 0 ? buildWhereClause(resolver) : { 1: 1 };
        let select = resolver.columns.length > 0 ? resolver.columns.toString() : '*';
        return connection_1.default.withSchema(resolver.schema).table(resolver.table).where(where).select(select);
    }
    BuilderHelper.buildQueryResolver = buildQueryResolver;
    //build the where clause for the knex query
    function buildWhereClause(r) {
        let criteria = {};
        for (let i = 0; i < r.where.length; i++) {
            //  criteria += {r.columns[index]:r.params[index]};
            let col = r.where[i];
            let val = r.params[i];
            criteria = Object.assign(criteria, { col: val });
        }
        return criteria;
    }
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