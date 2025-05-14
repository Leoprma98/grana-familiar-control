
// Format number as Brazilian Real (R$)
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

// Format date as day/month/year
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('pt-BR').format(date);
};

// Get month name in Portuguese
export const getMonthName = (month: number): string => {
  const months = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro'
  ];
  return months[month];
};
