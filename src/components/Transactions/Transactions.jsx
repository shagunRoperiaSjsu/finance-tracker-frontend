import { useEffect, useState } from 'react';
import { 
  Container, 
  Title, 
  Table, 
  Text, 
  Group, 
  Select, 
  Pagination,
  Stack,
  NumberInput,
  Button
} from '@mantine/core';
import Papa from 'papaparse'; // Import PapaParse
import { CATEGORIES, PAYMENT_MODES, TRANSACTION_TYPES } from '../../data/mockTransactions';
import { IconPlus } from '@tabler/icons-react';
import AddTransactionModal from './AddTransactionModal';
import api from '../../api';

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState({
    category: '',
    type: '',
    mode: ''
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Calculate total pages
  const totalPages = Math.ceil(filteredTransactions.length / pageSize);
  
  // Get current page transactions
  const getCurrentPageTransactions = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredTransactions.slice(startIndex, endIndex);
  };

  const fetchTransactions = async () => {
    const response = await api.get(`api/v1/transactions`);
    setTransactions(response.data);
  };

  useEffect(() => {
    // Load CSV data
    fetchTransactions();
  }, []);

  useEffect(() => {
    let filtered = [...transactions];

    if (filters.category) {
      filtered = filtered.filter(t => t.category === filters.category);
    }
    if (filters.type) {
      filtered = filtered.filter(t => t.type === filters.type);
    }
    if (filters.mode) {
      filtered = filtered.filter(t => t.mode === filters.mode);
    }

    // Sort by date descending
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    setFilteredTransactions(filtered);
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [transactions, filters]);

  const handleAddTransaction = (newTransaction) => {
    setTransactions(prev => [newTransaction, ...prev]);
  };

  return (
    <Container size="lg">
      <Group justify="space-between" mb="md">
        <Title order={2}>Transactions</Title>
        <Button 
          leftSection={<IconPlus size={16} />}
          onClick={() => setIsAddModalOpen(true)}
        >
          Add Transaction
        </Button>
      </Group>

      {/* Add Transaction Modal */}
      <AddTransactionModal
        opened={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddTransaction}
      />

      {/* Filters */}
      <Stack mb="md">
        <Group>
          <Select
            label="Category"
            placeholder="All Categories"
            data={Object.values(CATEGORIES).map(cat => ({ value: cat.name, label: cat.name }))}
            value={filters.category}
            onChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
            clearable
          />
          <Select
            label="Type"
            placeholder="All Types"
            data={Object.values(TRANSACTION_TYPES).map(type => ({ value: type, label: type }))}
            value={filters.type}
            onChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
            clearable
          />
          <Select
            label="Payment Mode"
            placeholder="All Modes"
            data={Object.values(PAYMENT_MODES).map(mode => ({ value: mode, label: mode }))}
            value={filters.mode}
            onChange={(value) => setFilters(prev => ({ ...prev, mode: value }))}
            clearable
          />
        </Group>

        {/* Results summary */}
        <Group justify="space-between" align="center">
          <Text size="sm" c="dimmed">
            Showing {Math.min(pageSize, filteredTransactions.length)} of {filteredTransactions.length} transactions
          </Text>
          
          <Group>
            <NumberInput
              label="Rows per page"
              value={pageSize}
              onChange={(value) => {
                setPageSize(value);
                setCurrentPage(1);
              }}
              min={5}
              max={100}
              step={5}
              w={100}
            />
          </Group>
        </Group>
      </Stack>

      {/* Transactions Table */}
      <Table mb="sm">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Date</Table.Th>
            <Table.Th>Mode</Table.Th>
            <Table.Th>Category</Table.Th>
            <Table.Th>Subcategory</Table.Th>
            <Table.Th>Note</Table.Th>
            <Table.Th>Amount</Table.Th>
            <Table.Th>Type</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {getCurrentPageTransactions().map(transaction => (
            <Table.Tr key={transaction.id}>
              <Table.Td>{new Date(transaction.date).toLocaleDateString()}</Table.Td>
              <Table.Td>{transaction.mode}</Table.Td>
              <Table.Td>{transaction.category}</Table.Td>
              <Table.Td>{transaction.subCategory}</Table.Td>
              <Table.Td>{transaction.note}</Table.Td>
              <Table.Td>
                <Text c={transaction.type === TRANSACTION_TYPES.EXPENSE ? 'red' : 'green'}>
                  ₹{transaction.amount.toLocaleString()}
                </Text>
              </Table.Td>
              <Table.Td>{transaction.type}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      {/* Pagination */}
      <Group justify="center">
        <Pagination 
          total={totalPages}
          value={currentPage}
          onChange={setCurrentPage}
          size="sm"
          siblings={1}
          boundaries={1}
        />
      </Group>
    </Container>
  );
}

export default Transactions; 