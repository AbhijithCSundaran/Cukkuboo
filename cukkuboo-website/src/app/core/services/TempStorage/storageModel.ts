export interface StorageItem {
    name: string;
    value: string | number;
}

export interface StorageList extends StorageItem {
    Storage?: StorageItem[];
}