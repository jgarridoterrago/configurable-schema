export interface PropertyType {
    name: string
    column: string;
    label: string;
    type: string;
    default?: string | null;
    description?: string | null;
    nullable?: true | false;
    resolver?: object;
}