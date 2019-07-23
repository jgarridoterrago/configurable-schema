import knex from "./connection";
import { ClassResolverType } from "./interface.resolvertype";
import { ClassDef } from "./interface.class";
import { QueryDef } from "./interface.query";
import { PropertyType } from "./interface.propertytype";

export namespace BuilderHelper{
    export function buildQueryResolver(o:PropertyType):any{
        let resolver:ClassResolverType = o.resolver as ClassResolverType;
        let where: any = resolver.where.length>0 ? buildWhereClause(resolver) : {1:1};
        let select: any = resolver.columns.length>0? resolver.columns.toString() : '*';
        return knex.withSchema(resolver.schema).table(resolver.table).where(where).select(select); 
    }

    //build the where clause for the knex query
    function buildWhereClause(r:ClassResolverType):{}{
        let criteria:any = {};
        for (let i = 0; i < r.where.length; i++) {
        //  criteria += {r.columns[index]:r.params[index]};
        let col = r.where[i];
        let val = r.params[i];
        criteria = Object.assign(criteria,{col : val});
        }
        return criteria;
    }

    export function getObjectColumns(o:ClassDef):Array<string>{
        let columns:Array<string>;
        o.properties.forEach((e:PropertyType) => {
          columns.push(e.column)
        });
        return columns;
    }

   

        export function getType(o:PropertyType):string{
            if(o.type.toLowerCase().includes('str'))
              return 'str'
            else if(o.type.toLowerCase().includes('int'))
              return 'int'
              else if(o.type.toLowerCase().includes('fl'))
              return 'float'
           else if(o.type.toLowerCase().includes('date'))
              return 'date'
            else if(o.type.toLowerCase().includes('json'))
              return 'json'
            else if(o.type.toLowerCase().includes('list'))
              return 'list'
            else
              return 'obj'
        }      
}
