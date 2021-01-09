export default interface Item {
  Name: string;
  Content: number;
  Toggle?: () => void;
  Thick: () => void;
}

