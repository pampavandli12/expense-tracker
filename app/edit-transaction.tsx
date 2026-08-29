import TransactionForm from "@/components/TransactionForm";
import { useLocalSearchParams } from "expo-router";

export default function EditTransaction() {
  const params = useLocalSearchParams<{
    id?: string;
    kind?: "income" | "expense";
  }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const kind = Array.isArray(params.kind) ? params.kind[0] : params.kind;

  return (
    <TransactionForm
      kind={kind === "income" ? "income" : "expense"}
      transactionId={id}
    />
  );
}
