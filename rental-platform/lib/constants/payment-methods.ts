export const PAYMENT_METHODS = {
  InstaPay: "InstaPay",
  VodafoneCash: "VodafoneCash",
  Cash: "Cash",
  BankTransfer: "BankTransfer",
} as const;

export type PaymentMethodType = (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethodType, string> = {
  InstaPay: "InstaPay",
  VodafoneCash: "Vodafone Cash",
  Cash: "Cash",
  BankTransfer: "Bank Transfer",
};

export const PAYMENT_METHOD_OPTIONS = [
  { value: "InstaPay", label: "InstaPay" },
  { value: "VodafoneCash", label: "Vodafone Cash" },
  { value: "Cash", label: "Cash" },
  { value: "BankTransfer", label: "Bank Transfer" },
];

