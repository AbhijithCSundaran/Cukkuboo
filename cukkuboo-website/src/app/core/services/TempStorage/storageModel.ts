export interface StorageItem {
    name: string;
    value: string | number | any;
}

export interface StorageList extends StorageItem {
    Storage?: StorageItem[];
}