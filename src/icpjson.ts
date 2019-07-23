import { ClassDef } from "./interface.class";
import { QueryDef } from "./interface.query";

export interface CustomProfileDef {//the json file is made up of the top level class definition custom profile class
    classes: [ClassDef];
    queries: [QueryDef];
}