interface ClassType {
    name: string
    column: string;
    label: string;
    type: string;
    description?: string | null;
    nullable?: true | false;
    resolver?: object;
}