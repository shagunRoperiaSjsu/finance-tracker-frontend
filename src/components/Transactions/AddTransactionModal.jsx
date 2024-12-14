import {
  Modal,
  TextInput,
  Select,
  NumberInput,
  Stack,
  Button,
  Group,
  Textarea,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  CATEGORIES,
  PAYMENT_MODES,
  TRANSACTION_TYPES,
} from "../../data/mockTransactions";
import api from "../../api";

function AddTransactionModal({ opened, onClose, onAdd }) {
  const form = useForm({
    initialValues: {
      type: TRANSACTION_TYPES.EXPENSE,
      category: "",
      subcategory: "",
      amount: 0,
      mode: "",
      note: "",
      date: new Date().toISOString().split("T")[0],
      userId: localStorage.getItem("userId"),
    },
    validate: {
      type: (value) => (!value ? "Type is required" : null),
      category: (value) => (!value ? "Category is required" : null),
      subcategory: (value) => (!value ? "Subcategory is required" : null),
      amount: (value) =>
        !value || value <= 0 ? "Amount must be greater than 0" : null,
      mode: (value) => (!value ? "Payment mode is required" : null),
      date: (value) => (!value ? "Date is required" : null),
    },
  });

  // Get subcategories based on selected category
  const getSubcategories = () => {
    const category =
      CATEGORIES[
        Object.keys(CATEGORIES).find(
          (key) => CATEGORIES[key].name === form.values.category
        )
      ];
    return category
      ? category.subcategories.map((sub) => ({ value: sub, label: sub }))
      : [];
  };

  const handleSubmit = async (values) => {
    try {
      const transactionData = {
        type: values.type,
        category: values.category,
        subCategory: values.subcategory,
        amount: values.amount,
        mode: values.mode,
        note: values.note || "No note",
        date: new Date(values.date),
        currency: "INR",
        userId: values.userId,
      };

      const response = await api.post("/api/v1/transactions", transactionData);

      if (response.data) {
        onAdd(response.data.transaction);
        form.reset();
        onClose();
      }
    } catch (error) {
      console.error("Error adding transaction:", error);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Add New Transaction"
      size="md"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <Select
            label="Transaction Type"
            placeholder="Select type"
            data={Object.values(TRANSACTION_TYPES).map((type) => ({
              value: type,
              label: type,
            }))}
            required
            {...form.getInputProps("type")}
          />

          <Group grow>
            <Select
              label="Category"
              placeholder="Select category"
              data={Object.values(CATEGORIES).map((cat) => ({
                value: cat.name,
                label: cat.name,
              }))}
              required
              {...form.getInputProps("category")}
              onChange={(value) => {
                form.setFieldValue("category", value);
                form.setFieldValue("subcategory", ""); // Reset subcategory when category changes
              }}
            />

            <Select
              label="Subcategory"
              placeholder="Select subcategory"
              data={getSubcategories()}
              required
              {...form.getInputProps("subcategory")}
              disabled={!form.values.category}
            />
          </Group>

          <Group grow>
            <NumberInput
              label="Amount"
              placeholder="Enter amount"
              min={0}
              required
              {...form.getInputProps("amount")}
            />

            <Select
              label="Payment Mode"
              placeholder="Select payment mode"
              data={Object.values(PAYMENT_MODES).map((mode) => ({
                value: mode,
                label: mode,
              }))}
              required
              {...form.getInputProps("mode")}
            />
          </Group>

          <TextInput
            label="Date"
            type="date"
            required
            {...form.getInputProps("date")}
          />

          <Textarea
            label="Note"
            placeholder="Add a note (optional)"
            {...form.getInputProps("note")}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Add Transaction</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

export default AddTransactionModal;
