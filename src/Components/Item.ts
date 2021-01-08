export interface Item {
  Name: string;
  Content: number;
  Toggle?: () => void;
  Thick: () => void;
}

export interface ControlItem extends Item {
  isOpen: boolean
}