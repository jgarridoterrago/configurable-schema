import knex from "./connection";
import { ClassResolverType } from "./interface.resolvertype";
import { ClassDef } from "./interface.class";
import { QueryDef } from "./interface.query";
import { PropertyType } from "./interface.propertytype";

export namespace BuilderHelper{
    
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
