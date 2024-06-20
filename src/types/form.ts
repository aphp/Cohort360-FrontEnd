export type FormContextType = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateFormData: (name: string, value: any) => void
  updateError: (isError: boolean) => void
}
