export type ControlItem = {
  key: string;
  controlType: string;
  mapfield: string;
  validate?: string;
  validateTrigger?: string;
  formRelay?: string;
  dataSourceApi?: string;
  radioOptions?: { id: string; value: string }[]; // Thêm radioOptions
  subControls?: ControlItem[]; // Thêm subControls
  [key: string]: any;
}

export type DynamicSignIn = {
    enable: boolean;
    key: string;
    mapfield: string;
    orders: number;
    type: "string" | "number" | "boolean" | "null";
    value: string | number | boolean | null;
    visible: boolean;
};
