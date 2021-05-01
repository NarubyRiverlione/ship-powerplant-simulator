export default interface Item {
  readonly Name: string
  Content: number
  Toggle?: () => void
  Thick?: () => void
}
