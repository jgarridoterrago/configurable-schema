export interface ResolverDef {
    table:string
    schema:string
    columns:[string] //display data from here
    where:[string] //search data from here
    params:[string]
}