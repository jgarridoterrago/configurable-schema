export interface QueryDef {
    className: string;
    excludes?: Array<string>;
    authenticate?: boolean | false;
    table: string;
    schema: string;
    nullable:boolean;
}
